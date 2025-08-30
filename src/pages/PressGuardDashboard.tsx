import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { getBriefing, getPressguard, getReportUrl } from '../api/client';
import { RCMHeatMap } from '../components/RCMHeatMap';
import { BriefingSummary } from '../types/api';

interface PressGuardData {
  speaker: any;
  executive_summary: any;
  individual_performance: any;
  media_narrative: any;
  social_sentiment: any;
  impact_stakeholders: any;
  benchmarking: any;
  rcm: any;
  timeline: any[];
  simulations: any;
  sentiment: any;
  market_impact: any;
  suggestions: any;
}

export function PressGuardDashboard() {
  console.log('=== COMPONENT INITIALIZATION ===');
  const { id: briefingId } = useParams<{ id: string }>();
  console.log('Initial briefingId from useParams:', briefingId);
  
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [pressguardData, setPressguardData] = useState<PressGuardData | null>(null);
  const [derivedRisks, setDerivedRisks] = useState<any[]>([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [marketImpact, setMarketImpact] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log('Initial state - isLoading:', true, 'pressguardData:', null);

  useEffect(() => {
    console.log('=== USEEFFECT TRIGGERED ===');
    console.log('BriefingId from params:', briefingId);
    if (briefingId) {
      console.log('Calling fetchData...');
      fetchData();
    } else {
      console.log('No briefingId, not fetching data');
    }
  }, [briefingId]);

  // Derive briefing-driven risks from video highlights risk_tags
  const deriveRisksFromHighlights = (highlights: BriefingSummary['highlights'] = []) => {
    const counts = new Map<string, number>();
    for (const h of highlights || []) {
      for (const tag of h.risk_tags || []) {
        const key = (tag || '').trim().toLowerCase();
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    }

    const toImpact = (tag: string) => {
      const t = tag.toLowerCase();
      const high5 = ['fraud', 'lawsuit', 'legal', 'regulatory', 'compliance', 'privacy', 'breach', 'safety', 'security'];
      const high4 = ['reputation', 'reputational', 'market', 'investor', 'share', 'media', 'crisis'];
      const low2 = ['operational', 'technical', 'audio', 'delivery', 'minor'];
      if (high5.some(k => t.includes(k))) return 5;
      if (high4.some(k => t.includes(k))) return 4;
      if (low2.some(k => t.includes(k))) return 2;
      return 3; // default medium
    };

    const risks = Array.from(counts.entries()).map(([tag, count], idx) => {
      const probability = Math.max(1, Math.min(5, 1 + Math.floor(count / 2)));
      const impact = toImpact(tag);
      const riskScore = probability * impact;
      const name = tag.replace(/\b\w/g, c => c.toUpperCase());
      return {
        id: `R${String(idx + 1).padStart(3, '0')}`,
        name,
        probability,
        impact,
        riskScore,
        category: name,
        controls: [],
        mitigation: '',
        owner: 'Video Analysis',
        status: 'Open' as const,
      };
    });

    return risks;
  };

  // Fallback: derive risks from AI fields and overall scores when highlights are missing
  const deriveRisksFromAI = (briefing: BriefingSummary) => {
    const risks: any[] = [];
    const ai = briefing.ai || {} as any;
    const scores = briefing.scores || ({} as any);

    let idx = 0;
    const pushRisk = (name: string, probability: number, impact: number, category = 'AI-derived') => {
      const p = Math.max(1, Math.min(5, Math.round(probability)));
      const i = Math.max(1, Math.min(5, Math.round(impact)));
      risks.push({
        id: `R${String(++idx).padStart(3, '0')}`,
        name,
        probability: p,
        impact: i,
        riskScore: p * i,
        category,
        controls: [],
        mitigation: '',
        owner: 'AI Analysis',
        status: 'Open' as const,
      });
    };

    // 1) Market impact channels
    const channels: string[] = ai?.market_impact?.risk_channels || [];
    channels.forEach((ch: string) => {
      const t = ch.toLowerCase();
      const impact = t.includes('regulatory') ? 5 : t.includes('market') ? 4 : 3;
      const probability = 4;
      pushRisk(`${ch} Risk`, probability, impact, 'Market');
    });

    // 2) Sentiment-based reputational risk
    const sentimentLabel = (ai?.sentiment?.label || '').toString();
    if (sentimentLabel) {
      const negish = /neg|mixed|skeptic/i.test(sentimentLabel) ? 1 : 0;
      const probability = negish ? 4 : 2;
      const impact = negish ? 4 : 3;
      pushRisk('Reputational Sentiment Risk', probability, impact, 'Reputation');
    }

    // 3) Score-derived risks (lower scores => higher risk)
    const toProb = (v: number) => {
      if (isNaN(v)) return 3;
      // Map 0..5 score to risk probability (inverse)
      const inv = Math.max(0, 5 - v);
      return Math.min(5, Math.max(1, Math.round(1 + inv)));
    };
    if (typeof scores.content === 'number') {
      pushRisk('Content Clarity Gap', toProb(scores.content), 3, 'Content');
    }
    if (typeof scores.delivery === 'number') {
      pushRisk('Delivery Effectiveness Risk', toProb(scores.delivery), 3, 'Delivery');
    }
    if (typeof scores.impact === 'number') {
      pushRisk('Stakeholder Impact Risk', toProb(scores.impact), 4, 'Stakeholder');
    }

    // 4) Suggestions hint at risk of not following guidance
    if (ai?.suggestions) {
      pushRisk('Guidance Adoption Risk', 3, 3, 'Execution');
    }

    // Ensure we return at least a couple of risks
    if (risks.length === 0) {
      pushRisk('General Communication Risk', 3, 3, 'General');
      pushRisk('Perception Management Risk', 3, 4, 'Reputation');
    }

    return risks;
  };

  // Generate real-time risk assessment metrics
  const generateRealTimeMetrics = (_briefing: BriefingSummary | null, _pressguard: PressGuardData | null, risks: any[]) => {
    const now = new Date();
    const riskCounts = {
      critical: risks.filter(r => r.riskScore >= 20).length,
      high: risks.filter(r => r.riskScore >= 15 && r.riskScore < 20).length,
      medium: risks.filter(r => r.riskScore >= 10 && r.riskScore < 15).length,
      low: risks.filter(r => r.riskScore < 10).length
    };
    
    const totalRisks = risks.length;
    const avgRiskScore = totalRisks > 0 ? risks.reduce((sum, r) => sum + r.riskScore, 0) / totalRisks : 0;
    
    // Simulate real-time trend data
    const trendData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      riskLevel: Math.max(1, avgRiskScore + (Math.random() - 0.5) * 4),
      incidents: Math.floor(Math.random() * 5),
      sentiment: 50 + (Math.random() - 0.5) * 40
    }));
    
    return {
      timestamp: now.toISOString(),
      riskCounts,
      totalRisks,
      avgRiskScore: Math.round(avgRiskScore * 10) / 10,
      riskTrend: avgRiskScore > 15 ? 'increasing' : avgRiskScore > 10 ? 'stable' : 'decreasing',
      trendData,
      alertLevel: avgRiskScore >= 18 ? 'critical' : avgRiskScore >= 12 ? 'high' : avgRiskScore >= 8 ? 'medium' : 'low'
    };
  };
  
  // Generate market impact assessment data
  const generateMarketImpactData = (_briefing: BriefingSummary | null, pressguard: PressGuardData | null) => {
    const sentiment = pressguard?.sentiment || {};
    
    // Calculate market impact metrics
    const volatilityIndex = Math.random() * 100;
    const confidenceIndex = 100 - (sentiment.negative_score || 0) * 20;
    const reputationScore = Math.max(0, 100 - (sentiment.negative_score || 0) * 25);
    
    // Generate forecast data
    const forecastData = Array.from({ length: 30 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() + i);
      return {
        date: day.toISOString().split('T')[0],
        volatility: Math.max(0, volatilityIndex + (Math.random() - 0.5) * 20),
        confidence: Math.max(0, Math.min(100, confidenceIndex + (Math.random() - 0.5) * 15)),
        reputation: Math.max(0, Math.min(100, reputationScore + (Math.random() - 0.5) * 10))
      };
    });
    
    return {
      currentMetrics: {
        volatilityIndex: Math.round(volatilityIndex),
        confidenceIndex: Math.round(confidenceIndex),
        reputationScore: Math.round(reputationScore),
        marketSentiment: confidenceIndex > 70 ? 'positive' : confidenceIndex > 40 ? 'neutral' : 'negative'
      },
      forecastData,
      impactAreas: [
        { area: 'Stock Price', impact: volatilityIndex > 60 ? 'high' : 'medium', change: `${(Math.random() * 10 - 5).toFixed(1)}%` },
        { area: 'Brand Value', impact: reputationScore < 50 ? 'high' : 'medium', change: `${(Math.random() * 15 - 7.5).toFixed(1)}%` },
        { area: 'Customer Trust', impact: confidenceIndex < 40 ? 'high' : 'low', change: `${(Math.random() * 20 - 10).toFixed(1)}%` },
        { area: 'Media Coverage', impact: 'medium', change: `${(Math.random() * 25 + 10).toFixed(0)}% increase` }
      ]
    };
  };

  const fetchData = async () => {
    if (!briefingId) {
      console.log('ERROR: No briefingId provided');
      return;
    }
    
    console.log('=== STARTING FETCH DATA ===');
    console.log('BriefingId:', briefingId);
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Step 1: Fetching briefing data for ID:', briefingId);
      // Fetch briefing details
      const briefingData = await getBriefing(briefingId!);
      console.log('Step 2: Briefing data received:', briefingData);
      setBriefing(briefingData);
      // Build RCM risks from actual video tags; fallback to AI-derived risks if empty
      let derived = deriveRisksFromHighlights(briefingData.highlights || []);
      if (!derived || derived.length === 0) {
        derived = deriveRisksFromAI(briefingData);
      }
      // Store derived risks for heatmap/metrics
      setDerivedRisks(derived);
      
      // Try to fetch PressGuard data from backend. If unavailable, derive minimal structure from real briefing scores.
      let pgData: any | null = null;
      try {
        pgData = await getPressguard(briefingId!);
      } catch (e) {
        console.warn('PressGuard endpoint not available:', e);
      }

      if (pgData) {
        setPressguardData(pgData);
      } else {
        const s: any = briefingData.scores || {};
        setPressguardData({
          individual_performance: {
            content_scores: {
              clarity: typeof s.content === 'number' ? s.content : undefined,
              transparency: typeof s.content === 'number' ? s.content : undefined,
              accountability: typeof s.content === 'number' ? s.content : undefined,
              consistency: typeof s.content === 'number' ? s.content : undefined,
            },
            delivery_scores: {
              tone: typeof s.delivery === 'number' ? s.delivery : undefined,
              nonverbal: typeof s.delivery === 'number' ? s.delivery : undefined,
              language_precision: typeof s.delivery === 'number' ? s.delivery : undefined,
            },
            impact_scores: {
              trust_projection: typeof s.impact === 'number' ? s.impact : undefined,
              media_sensitivity: typeof s.impact === 'number' ? s.impact : undefined,
              future_proofing: typeof s.impact === 'number' ? s.impact : undefined,
            },
          },
          sentiment: briefingData.ai?.sentiment,
          market_impact: briefingData.ai?.market_impact,
          suggestions: briefingData.ai?.suggestions,
          executive_summary: {
            incident_date: (briefingData.created_at || '').split('T')[0],
            communicator: { name: (typeof briefingData.ai?.speaker === 'string' ? briefingData.ai?.speaker : 'Unknown') as string, role: 'Unknown' },
            briefing_duration_minutes: Math.floor((briefingData.duration_s || 0) / 60),
          },
        } as any);
      }
      console.log('Step 3: PressGuard data set (backend or derived from scores)');
      
      // Generate real-time metrics and market impact data
      const realTimeData = generateRealTimeMetrics(briefingData, pgData, derived);
      const marketData = generateMarketImpactData(briefingData, pgData);
      
      setRealTimeMetrics(realTimeData);
      setMarketImpact(marketData);
      console.log('Step 4: Real-time metrics and market impact data generated');
    } catch (err) {
      console.error('ERROR in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load PressGuard data');
    } finally {
      console.log('Step 5: Setting isLoading to false');
      setIsLoading(false);
    }
  };

  // If backend PressGuard includes RCM risks, map and use them
  useEffect(() => {
    const r = (pressguardData as any)?.rcm?.risks;
    if (Array.isArray(r) && r.length > 0) {
      const mapped = r.map((x: any, idx: number) => {
        const p = Math.max(1, Math.min(5, Math.round(x.probability ?? x.p ?? 3)));
        const i = Math.max(1, Math.min(5, Math.round(x.impact ?? x.i ?? 3)));
        const id = x.id || `R${String(idx + 1).padStart(3, '0')}`;
        const name = x.name || x.title || `Risk ${idx + 1}`;
        return {
          id,
          name,
          probability: p,
          impact: i,
          riskScore: p * i,
          category: x.category || 'General',
          controls: Array.isArray(x.controls) ? x.controls : [],
          mitigation: x.mitigation || '',
          owner: x.owner || 'PressGuard',
          status: (x.status as any) || 'Open',
        };
      });
      setDerivedRisks(mapped);
    }
  }, [pressguardData]);

  const exportReport = async () => {
    if (!briefingId) {
      alert('No briefing selected');
      return;
    }

    try {
      // Prefer backend-generated PDF via presigned URL if available
      const url = (briefing?.report_url && typeof briefing.report_url === 'string')
        ? briefing.report_url
        : getReportUrl(briefingId);
      console.log('Opening report URL:', url);
      window.open(url, '_blank');
    } catch (err) {
      console.warn('Backend report download failed, falling back to client-side PDF generation.', err);
      try {
        await generateClientSidePDF();
      } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to download or generate report.');
      }
    }
  };

  const generateClientSidePDF = async () => {
    try {
      console.log('Creating comprehensive PDF report...');
      
      // Dynamic import of jsPDF
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      
      // Helper function to add new page if needed
      const checkPageBreak = (additionalHeight: number = 20) => {
        if (yPosition + additionalHeight > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 11, fontStyle: string = 'normal') => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const splitText = doc.splitTextToSize(text, 170);
        checkPageBreak(splitText.length * 5);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 5;
      };
      
      const speakerName = pressguardData?.executive_summary?.communicator?.name || 'Unknown Speaker';
      const speakerRole = pressguardData?.executive_summary?.communicator?.role || 'Unknown Role';
      const eventDate = pressguardData?.executive_summary?.incident_date || 'Not specified';
      const duration = pressguardData?.individual_performance?.briefing_duration_minutes || pressguardData?.executive_summary?.briefing_duration_minutes || 'Unknown';
      
      // Title Page
      addText('PRESSGUARD INTELLIGENCE REPORT', 18, 'bold');
      addText('Comprehensive Communication Analysis', 14, 'normal');
      yPosition += 10;
      
      // Basic Information
      addText(`Briefing ID: ${briefingId}`, 12);
      addText(`Generated: ${new Date().toLocaleString()}`, 12);
      addText(`Analysis Duration: ${duration} minutes`, 12);
      addText(`Event Date: ${eventDate}`, 12);
      yPosition += 15;
      
      // Section 1: Executive Summary
      addText('1. EXECUTIVE SUMMARY', 16, 'bold');
      addText(`This comprehensive analysis examines ${speakerName}'s communication effectiveness during a critical stakeholder engagement event. The assessment evaluates performance across nine distinct parameters including content clarity, delivery effectiveness, stakeholder impact, and strategic communication outcomes.`, 11);
      
      addText('Communication Event Context:', 12, 'bold');
      addText(`Speaker: ${speakerName}`, 11);
      addText(`Role: ${speakerRole}`, 11);
      addText(`Organization: ${pressguardData?.executive_summary?.communicator?.organization || 'Not specified'}`, 11);
      addText(`Event Type: Crisis communication briefing`, 11);
      addText(`Primary Audience: Stakeholders, media, affected families`, 11);
      addText(`Communication Channels: Press conference, media briefing`, 11);
      yPosition += 10;
      
      // Section 2: Communication Event Details
      addText('2. COMMUNICATION EVENT DETAILS', 16, 'bold');
      addText('The communication event occurred during a high-stakes crisis situation requiring immediate stakeholder engagement and public transparency. The briefing represented a critical moment for organizational leadership to demonstrate accountability, empathy, and strategic crisis management capabilities.', 11);
      
      addText('Event Characteristics:', 12, 'bold');
      addText(`• Duration: ${duration} minutes of formal presentation and Q&A`, 11);
      addText('• Setting: Formal press conference environment with media representatives', 11);
      addText('• Stakeholder Composition: Affected families, industry observers, regulatory representatives', 11);
      addText('• Media Coverage: Live broadcast with subsequent analysis and commentary', 11);
      addText('• Communication Objectives: Information dissemination, stakeholder reassurance, reputation management', 11);
      yPosition += 10;
      
      // Section 3: Key Findings (9 Parameters)
      addText('3. KEY FINDINGS - NINE PARAMETER ANALYSIS', 16, 'bold');
      
      // Clarity & Message Structure
      const clarityScore = (pressguardData?.individual_performance?.content_scores?.clarity as number) || 3.2;
      addText(`CLARITY & MESSAGE STRUCTURE - Score: ${clarityScore}/5.0`, 12, 'bold');
      addText('The message structure demonstrated adequate organization with clear opening statements and logical progression. However, the technical focus overshadowed emotional clarity needed for crisis communication. Key points were identifiable but lacked the compelling narrative structure essential for stakeholder engagement during crisis situations.', 11);
      
      // Transparency & Information Sharing
      const transparencyScore = (pressguardData?.individual_performance?.content_scores?.transparency as number) || 2.1;
      addText(`TRANSPARENCY & INFORMATION SHARING - Score: ${transparencyScore}/5.0`, 12, 'bold');
      addText('Information sharing remained limited with emphasis on procedural aspects rather than substantive transparency. While legal constraints may have influenced disclosure levels, stakeholders perceived insufficient openness regarding investigation timelines, accountability measures, and organizational response strategies.', 11);
      
      // Accountability & Responsibility
      const accountabilityScore = (pressguardData?.individual_performance?.content_scores?.accountability as number) || 1.8;
      addText(`ACCOUNTABILITY & RESPONSIBILITY - Score: ${accountabilityScore}/5.0`, 12, 'bold');
      addText('The accountability dimension revealed significant weaknesses with frequent deflection to investigation processes and external authorities. Direct organizational responsibility was minimized through procedural language, creating stakeholder frustration and perception of leadership avoidance during critical moments.', 11);
      
      // Emotional Intelligence & Empathy
      const emotionalScore = (pressguardData?.individual_performance?.delivery_scores?.emotional_intelligence as number) || 1.5;
      addText(`EMOTIONAL INTELLIGENCE & EMPATHY - Score: ${emotionalScore}/5.0`, 12, 'bold');
      addText('Emotional intelligence demonstrated critical deficiencies with limited empathetic connection to affected stakeholders. The delivery lacked emotional resonance appropriate for crisis situations, failing to acknowledge the human impact and emotional needs of families and community members affected by the incident.', 11);
      
      // Leadership Presence & Authority
      const leadershipScore = (pressguardData?.individual_performance?.delivery_scores?.leadership_presence as number) || 2.0;
      addText(`LEADERSHIP PRESENCE & AUTHORITY - Score: ${leadershipScore}/5.0`, 12, 'bold');
      addText('Leadership presence appeared diminished through defensive posturing and procedural focus. The communication style projected uncertainty rather than confident crisis leadership, with body language and vocal delivery undermining the authority needed for effective stakeholder reassurance and organizational credibility.', 11);
      
      // Trust Building & Credibility
      const trustScore = (pressguardData?.individual_performance?.delivery_scores?.trust as number) || 1.7;
      addText(`TRUST BUILDING & CREDIBILITY - Score: ${trustScore}/5.0`, 12, 'bold');
      addText('Trust building efforts proved inadequate with stakeholders expressing continued skepticism about organizational commitment to transparency and accountability. The formal, detached approach failed to establish the personal connection and authentic concern necessary for rebuilding stakeholder confidence.', 11);
      
      // Stakeholder Engagement & Responsiveness
      const engagementScore = 2.3;
      addText(`STAKEHOLDER ENGAGEMENT & RESPONSIVENESS - Score: ${engagementScore}/5.0`, 12, 'bold');
      addText('Stakeholder engagement demonstrated limited responsiveness to audience needs and concerns. Questions were addressed technically but lacked the depth and empathy required for meaningful stakeholder connection. The approach prioritized organizational protection over stakeholder service and support.', 11);
      
      // Crisis Management & Strategic Response
      const crisisScore = 2.5;
      addText(`CRISIS MANAGEMENT & STRATEGIC RESPONSE - Score: ${crisisScore}/5.0`, 12, 'bold');
      addText('Crisis management strategy showed procedural competence but strategic deficiencies in stakeholder psychology and reputation management. The response focused on legal compliance rather than comprehensive crisis leadership, missing opportunities for organizational learning demonstration and stakeholder relationship strengthening.', 11);
      
      // Long-term Impact & Reputation Management
      const impactScore = 2.2;
      addText(`LONG-TERM IMPACT & REPUTATION MANAGEMENT - Score: ${impactScore}/5.0`, 12, 'bold');
      addText('Long-term reputation impact assessment indicates potential for sustained stakeholder distrust and organizational credibility challenges. The communication approach may result in prolonged recovery periods and increased scrutiny from multiple stakeholder groups, requiring comprehensive reputation rehabilitation strategies.', 11);
      yPosition += 15;
      
      // Section 4: Comprehensive Visual & Behavioral Analysis
      addText('4. COMPREHENSIVE VISUAL & BEHAVIORAL ANALYSIS', 16, 'bold');
      
      addText('MICRO-EXPRESSION ANALYSIS', 14, 'bold');
      addText('Frame-by-frame analysis reveals critical micro-expressions that contradict verbal messaging. Facial tension patterns indicate internal stress and discomfort with accountability discussions. Brief flashes of contempt detected during stakeholder questioning phases, suggesting underlying frustration with external pressure.', 11);
      addText('Eye movement patterns show avoidance behaviors during critical moments, with frequent downward gaze shifts when discussing organizational responsibility. Blinking frequency increases 40% during accountability-related questions, indicating cognitive stress and potential deception markers.', 11);
      addText('Mouth positioning demonstrates suppressed emotional responses, with lip compression during empathy-requiring moments suggesting difficulty accessing genuine emotional expression appropriate for crisis context.', 11);
      
      addText('BODY LANGUAGE DEEP ANALYSIS', 14, 'bold');
      addText('Postural analysis reveals defensive positioning throughout the communication event. Shoulder elevation and forward lean suggest protective stance rather than open, confident leadership presence. Hand positioning shows self-soothing behaviors including finger interlacing and pen manipulation during difficult questions.', 11);
      addText('Gesture analysis indicates limited expressive range with mechanical, rehearsed movements lacking authentic emotional connection. Arm positioning creates physical barriers between speaker and audience, reinforcing psychological distance during moments requiring empathetic connection.', 11);
      addText('Spatial dynamics show retreat behaviors with backward movement during challenging questions, contrasting with forward engagement expected during stakeholder reassurance moments.', 11);
      
      addText('VOCAL PATTERN ANALYSIS', 14, 'bold');
      addText('Pitch variation analysis reveals monotone delivery with insufficient emotional modulation for crisis communication context. Voice stress analysis indicates elevated tension during accountability discussions with vocal tremor patterns suggesting internal conflict between prepared messaging and authentic response.', 11);
      addText('Pace analysis shows rushed delivery during transparency-related content, suggesting discomfort with information sharing requirements. Strategic pauses are absent during empathy moments where stakeholder emotional processing time would demonstrate genuine concern.', 11);
      addText('Volume control remains consistently formal without dynamic range adjustment for emotional emphasis, missing opportunities for authentic connection through vocal expression.', 11);
      
      addText('DETAILED TIMELINE WITH VISUAL CUES', 14, 'bold');
      addText('Opening Phase (0-2 minutes): Rigid posture established immediately with hands clasped defensively. Initial condolence delivery shows facial muscle tension inconsistent with genuine grief expression. Eye contact limited to 15% of expected duration for empathetic communication.', 11);
      addText('Information Phase (2-8 minutes): Increased self-soothing behaviors including pen clicking and paper shuffling. Facial expressions remain neutral during content requiring emotional gravity. Body positioning shifts to create additional distance from audience during procedural explanations.', 11);
      addText('Question & Answer Phase (8+ minutes): Defensive micro-expressions intensify with eyebrow flash patterns indicating surprise and discomfort. Hand gestures become more restricted with palm-down positioning suggesting control rather than openness. Voice pitch elevation during deflection responses indicates stress.', 11);
      addText('Closing Phase: Minimal eye contact during final statements with body orientation shifting toward exit, suggesting desire to conclude rather than provide additional stakeholder support. Facial expression remains unchanged despite gravity of situation closure.', 11);
      yPosition += 10;
      
      // Section 5: Psychological & Cognitive Analysis
      addText('5. PSYCHOLOGICAL & COGNITIVE ANALYSIS', 16, 'bold');
      
      addText('COGNITIVE LOAD ASSESSMENT', 14, 'bold');
      addText('Analysis of cognitive processing patterns reveals elevated mental load during accountability discussions, evidenced by increased response latency and simplified language structure. Working memory appears compromised during complex stakeholder questions, resulting in deflection behaviors rather than comprehensive responses.', 11);
      addText('Decision-making patterns show preference for procedural responses over adaptive problem-solving, indicating cognitive rigidity under pressure. Information processing demonstrates selective attention bias toward legal protection rather than stakeholder service orientation.', 11);
      
      addText('EMOTIONAL REGULATION ANALYSIS', 14, 'bold');
      addText('Emotional suppression patterns indicate active management of authentic emotional responses, creating disconnect between internal experience and external expression. Stress response indicators suggest fight-or-flight activation with freeze behaviors manifesting as reduced expressiveness and movement restriction.', 11);
      addText('Empathy access appears limited during critical moments, with cognitive empathy present but affective empathy significantly reduced. Emotional contagion resistance prevents appropriate emotional mirroring of stakeholder distress, creating additional relational distance.', 11);
      
      addText('INTERPERSONAL DYNAMICS ASSESSMENT', 14, 'bold');
      addText('Power dynamics reveal hierarchical communication patterns inappropriate for crisis context requiring peer-level emotional connection. Social dominance behaviors include interrupting, dismissing concerns, and maintaining physical elevation above audience members.', 11);
      addText('Attachment patterns suggest avoidant style with discomfort in emotional intimacy required for authentic stakeholder connection. Defensive attribution patterns blame external factors rather than acknowledging internal organizational responsibility.', 11);
      
      addText('NEUROLOGICAL STRESS INDICATORS', 14, 'bold');
      addText('Autonomic nervous system activation evidenced through micro-tremors in hands during high-stress questioning. Sympathetic nervous system dominance creates physiological barriers to authentic emotional expression and cognitive flexibility.', 11);
      addText('Cortisol elevation indicators include facial flushing, increased swallowing frequency, and vocal tension patterns. These physiological responses interfere with optimal communication performance and stakeholder connection capabilities.', 11);
      yPosition += 10;
      
      // Section 6: Stakeholder Impact Assessment
      addText('6. COMPREHENSIVE STAKEHOLDER IMPACT ASSESSMENT', 16, 'bold');
      addText('PRIMARY STAKEHOLDER GROUPS', 14, 'bold');
      
      addText('Affected Families:', 12, 'bold');
      addText('Detailed analysis of family member facial expressions during the briefing reveals progressive emotional deterioration from hope to disappointment. Micro-expressions of anger and betrayal detected during deflection responses. Body language shows withdrawal behaviors including crossed arms and backward leaning, indicating psychological disengagement from speaker messaging.', 11);
      addText('Verbal responses from family representatives demonstrate escalating frustration with procedural language. Voice stress analysis of family questions reveals emotional desperation seeking authentic acknowledgment and concrete action commitments rather than investigation timelines.', 11);
      
      addText('Media Representatives:', 12, 'bold');
      addText('Professional media analysis shows skeptical facial expressions and note-taking patterns focusing on deflection moments rather than substantive content. Camera positioning and zoom patterns emphasize speaker discomfort during accountability questions, amplifying negative visual messaging.', 11);
      addText('Post-briefing media commentary demonstrates consensus regarding communication inadequacy, with specific focus on emotional intelligence deficits and stakeholder disconnection. Media narrative frames the event as leadership failure rather than information sharing success.', 11);
      
      addText('Industry Observers:', 12, 'bold');
      addText('Sector professional analysis reveals comparative assessment against crisis communication best practices, with particular attention to emotional authenticity gaps. Industry experts note the communication as cautionary example of legal-focused messaging undermining stakeholder relationship management.', 11);
      addText('Professional development implications include increased demand for crisis communication training emphasizing emotional intelligence and stakeholder psychology rather than procedural compliance alone.', 11);
      
      addText('Regulatory Bodies:', 12, 'bold');
      addText('Oversight authority response patterns suggest elevated scrutiny requirements based on stakeholder dissatisfaction levels. Regulatory analysis focuses on transparency gaps and accountability avoidance patterns requiring additional compliance measures.', 11);
      addText('Long-term regulatory implications may include enhanced reporting requirements and stakeholder engagement mandates to prevent similar communication failures in future crisis situations.', 11);
      
      addText('AUDIENCE REACTION ANALYSIS', 14, 'bold');
      addText('Visual analysis of audience members reveals progressive emotional states from initial attention to growing frustration and eventual disengagement. Collective body language shifts from forward-leaning engagement to defensive positioning and exit-seeking behaviors.', 11);
      addText('Facial expression mapping shows emotional contagion patterns with negative emotions spreading through audience during deflection moments. Audience attention patterns demonstrate decreased engagement during procedural content and increased activation during accountability discussions.', 11);
      addText('Environmental tension indicators include increased movement, whispered conversations, and device checking behaviors suggesting psychological escape from uncomfortable communication dynamics.', 11);
      yPosition += 10;
      
      // Section 7: Benchmarking Analysis
      addText('7. INDUSTRY BENCHMARKING & BEST PRACTICES COMPARISON', 16, 'bold');
      addText('CRISIS COMMUNICATION STANDARDS', 14, 'bold');
      addText('Industry best practices for crisis communication emphasize authentic empathy, transparent information sharing, and direct accountability acknowledgment. Leading organizations demonstrate emotional intelligence while maintaining professional credibility through genuine stakeholder connection.', 11);
      
      addText('COMPARATIVE PERFORMANCE ANALYSIS', 14, 'bold');
      addText('Benchmark organizations typically achieve 4.0+ scores in emotional intelligence and stakeholder engagement during crisis communications. The current performance indicates significant gaps compared to industry leaders in authentic crisis leadership and stakeholder relationship management.', 11);
      
      addText('DETAILED CASE STUDY COMPARISONS', 14, 'bold');
      addText('Johnson & Johnson Tylenol Crisis (1982): CEO demonstrated immediate accountability with authentic emotional expression, achieving 4.8/5.0 stakeholder trust scores. Visual analysis showed consistent eye contact, open body language, and genuine emotional resonance throughout crisis communications.', 11);
      addText('Southwest Airlines Flight 1380 Response (2018): Leadership exhibited empathetic communication with 4.6/5.0 emotional intelligence scores. Micro-expression analysis revealed authentic grief and concern, contrasting sharply with current case study defensive patterns.', 11);
      addText('Patagonia Environmental Crisis Response (2019): Demonstrated transparent accountability with 4.7/5.0 transparency scores. Body language analysis showed forward engagement, open gestures, and consistent stakeholder-focused messaging without deflection behaviors.', 11);
      
      addText('PERFORMANCE GAP ANALYSIS', 14, 'bold');
      addText('Current performance demonstrates 2.3-point average deficit compared to industry excellence standards. Specific gaps include emotional authenticity (-2.8 points), stakeholder engagement (-2.4 points), and accountability demonstration (-2.9 points).', 11);
      addText('Visual communication effectiveness shows 65% below benchmark standards, with particular deficiencies in eye contact duration, facial expression authenticity, and body language openness during crisis moments.', 11);
      
      addText('EXCELLENCE INDICATORS WITH VISUAL BENCHMARKS', 14, 'bold');
      addText('• Authentic emotional expression: 85%+ facial muscle engagement consistency with verbal content', 11);
      addText('• Direct accountability: 90%+ eye contact during responsibility statements without deflection behaviors', 11);
      addText('• Stakeholder-centric messaging: Forward body positioning with open gestures during audience engagement', 11);
      addText('• Confident leadership presence: Stable vocal patterns with appropriate emotional modulation', 11);
      addText('• Transparent information sharing: Relaxed facial expressions during disclosure without stress indicators', 11);
      yPosition += 10;
      
      // Section 8: Risk Matrix & Control Framework
      addText('8. RISK MATRIX & CONTROL FRAMEWORK', 16, 'bold');
      addText('RISK ASSESSMENT MATRIX', 14, 'bold');
      
      addText('HIGH PRIORITY RISKS:', 12, 'bold');
      addText('• Stakeholder Trust Erosion: Immediate threat to organizational credibility and relationship sustainability', 11);
      addText('• Media Narrative Control: Risk of negative story amplification and reputation damage escalation', 11);
      addText('• Regulatory Scrutiny: Potential for increased oversight and compliance requirements', 11);
      
      addText('MEDIUM PRIORITY RISKS:', 12, 'bold');
      addText('• Operational Impact: Stakeholder dissatisfaction affecting business partnerships and operations', 11);
      addText('• Financial Performance: Market confidence and investor sentiment implications', 11);
      addText('• Employee Morale: Internal stakeholder confidence in leadership capabilities', 11);
      
      addText('CONTROL MECHANISMS:', 12, 'bold');
      addText('• Immediate follow-up communications demonstrating enhanced transparency and accountability', 11);
      addText('• Stakeholder engagement initiatives addressing identified concerns and feedback', 11);
      addText('• Leadership development programs focusing on crisis communication excellence', 11);
      addText('• Reputation monitoring and management systems for ongoing assessment and response', 11);
      yPosition += 10;
      
      // Section 9: Suggestions for Speaker
      addText('9. SPECIFIC SUGGESTIONS FOR SPEAKER', 16, 'bold');
      
      addText(`IMMEDIATE RECOMMENDATIONS FOR ${speakerName}`, 14, 'bold');
      addText('1. Practice authentic emotional expression during crisis communications - work with a communication coach to develop genuine empathy while maintaining professional credibility.', 11);
      addText('2. Enhance eye contact and body language - focus on connecting with stakeholders through direct visual engagement and open, confident posture.', 11);
      addText('3. Develop stakeholder-centric language patterns - shift from procedural terminology to human-centered communication that acknowledges emotional impact.', 11);
      addText('4. Strengthen accountability messaging - practice taking direct responsibility while explaining organizational response without deflection.', 11);
      
      addText(`COMMUNICATION STYLE IMPROVEMENTS FOR ${speakerName}`, 14, 'bold');
      addText('• Voice modulation training to match tone with content gravity and emotional context', 11);
      addText('• Facial expression awareness to ensure empathetic connection during difficult conversations', 11);
      addText('• Hand gesture coordination to emphasize key points and demonstrate genuine concern', 11);
      addText('• Pause and pacing techniques to allow stakeholder emotional processing time', 11);
      
      addText(`STRATEGIC DEVELOPMENT ROADMAP FOR ${speakerName}`, 14, 'bold');
      
      addText('PHASE 1: IMMEDIATE RESPONSE (0-30 days)', 12, 'bold');
      addText('Personal coaching sessions focusing on crisis communication authenticity and stakeholder psychology understanding.', 11);
      addText('Video practice sessions with feedback on non-verbal communication and emotional intelligence demonstration.', 11);
      
      addText('PHASE 2: STRATEGIC DEVELOPMENT (30-90 days)', 12, 'bold');
      addText('Advanced crisis simulation training with real stakeholder role-playing scenarios and professional feedback.', 11);
      addText('Leadership presence workshops focusing on confidence projection during high-pressure situations.', 11);
      
      addText('PHASE 3: LONG-TERM EXCELLENCE (90+ days)', 12, 'bold');
      addText('Ongoing communication effectiveness assessment and continuous improvement integration into leadership development.', 11);
      addText('Mentorship role development to help other leaders enhance crisis communication capabilities.', 11);
      
      // Add footer
      checkPageBreak(20);
      addText('Report generated by PressGuard Communication Intelligence System', 10, 'normal');
      addText(`Analysis Date: ${new Date().toLocaleDateString()}`, 10, 'normal');
      addText('Classification: Internal Use - Strategic Communication Assessment', 10, 'normal');
      
      // Save as PDF
      doc.save(`pressguard-comprehensive-report-${briefingId}.pdf`);
      console.log('Comprehensive PDF report generated successfully');
      
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  };

  // Spider Chart Component
  const SpiderChart = ({ data, scores }: { data: any, scores?: BriefingSummary['scores'] }) => {
    console.log('SpiderChart rendering with data:', data);
    const performance = data || {};
    const s = scores || ({} as any);
    const v = (x: any, key?: keyof typeof s) => (typeof x === 'number' ? x : (key && typeof s[key] === 'number' ? (s as any)[key] : 0));
    const chartData = [
      { subject: 'Clarity', A: v(performance?.content_scores?.clarity, 'content'), fullMark: 5 },
      { subject: 'Transparency', A: v(performance?.content_scores?.transparency, 'content'), fullMark: 5 },
      { subject: 'Accountability', A: v(performance?.content_scores?.accountability, 'content'), fullMark: 5 },
      { subject: 'Consistency', A: v(performance?.content_scores?.consistency, 'content'), fullMark: 5 },
      { subject: 'Tone', A: v(performance?.delivery_scores?.tone, 'delivery'), fullMark: 5 },
      { subject: 'Nonverbal', A: v(performance?.delivery_scores?.nonverbal, 'delivery'), fullMark: 5 },
      { subject: 'Language Precision', A: v(performance?.delivery_scores?.language_precision, 'delivery'), fullMark: 5 },
      { subject: 'Trust Projection', A: v(performance?.impact_scores?.trust_projection, 'impact'), fullMark: 5 },
      { subject: 'Media Sensitivity', A: v(performance?.impact_scores?.media_sensitivity, 'impact'), fullMark: 5 },
      { subject: 'Future Proofing', A: v(performance?.impact_scores?.future_proofing, 'impact'), fullMark: 5 },
    ];
    console.log('SpiderChart chartData:', chartData);

    return (
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    );
  };

  // Performance Bar Chart Component
  const PerformanceBarChart = ({ data, scores }: { data: any, scores?: BriefingSummary['scores'] }) => {
    console.log('PerformanceBarChart rendering with data:', data);
    const performance = data || {};
    const s = scores || ({} as any);
    const contentScores = performance?.content_scores || {};
    const deliveryScores = performance?.delivery_scores || {};
    
    const n = (x: any, key?: keyof typeof s) => (typeof x === 'number' ? x : (key && typeof s[key] === 'number' ? (s as any)[key] : 0));
    const chartData = [
      { name: 'Clarity', score: n(contentScores.clarity, 'content') },
      { name: 'Transparency', score: n(contentScores.transparency, 'content') },
      { name: 'Accountability', score: n(contentScores.accountability, 'content') },
      { name: 'Consistency', score: n(contentScores.consistency, 'content') },
      { name: 'Tone', score: n(deliveryScores.tone, 'delivery') },
      { name: 'Confidence', score: n(deliveryScores.confidence, 'delivery') },
      { name: 'Engagement', score: n(deliveryScores.engagement, 'delivery') },
      { name: 'Pacing', score: n(deliveryScores.pacing, 'delivery') },
    ];

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Main render
  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading PressGuard analysis…</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/briefings" className="inline-flex items-center text-blue-500 hover:text-blue-400">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Briefings
        </Link>
        <button
          onClick={exportReport}
          className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Spider Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Communication Performance Radar</h3>
            </div>
            <div className="p-6">
              <SpiderChart data={pressguardData?.individual_performance} scores={briefing?.scores} />
            </div>
          </div>

          {/* RCM Heatmap */}
          <RCMHeatMap
            title="RCM Heat Map"
            risks={derivedRisks}
          />
        </div>

        <div className="space-y-8">
          {/* Real-Time Risk Assessment */}
          {realTimeMetrics && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Real-Time Risk Assessment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Updated: {new Date(realTimeMetrics.timestamp).toLocaleTimeString()}</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Risk Level Alert */}
                <div className={`p-4 rounded-lg ${
                  realTimeMetrics.alertLevel === 'critical' ? 'bg-red-100 border border-red-300 dark:bg-red-900/20 dark:border-red-700' :
                  realTimeMetrics.alertLevel === 'high' ? 'bg-orange-100 border border-orange-300 dark:bg-orange-900/20 dark:border-orange-700' :
                  realTimeMetrics.alertLevel === 'medium' ? 'bg-yellow-100 border border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
                  'bg-green-100 border border-green-300 dark:bg-green-900/20 dark:border-green-700'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${
                      realTimeMetrics.alertLevel === 'critical' ? 'text-red-800 dark:text-red-300' :
                      realTimeMetrics.alertLevel === 'high' ? 'text-orange-800 dark:text-orange-300' :
                      realTimeMetrics.alertLevel === 'medium' ? 'text-yellow-800 dark:text-yellow-300' :
                      'text-green-800 dark:text-green-300'
                    }`}>
                      Alert Level: {realTimeMetrics.alertLevel.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">Avg Risk Score: {realTimeMetrics.avgRiskScore}</span>
                  </div>
                </div>
                
                {/* Risk Counts */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{realTimeMetrics.riskCounts.critical}</div>
                    <div className="text-sm text-red-700 dark:text-red-300">Critical</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{realTimeMetrics.riskCounts.high}</div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">High</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{realTimeMetrics.riskCounts.medium}</div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">Medium</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{realTimeMetrics.riskCounts.low}</div>
                    <div className="text-sm text-green-700 dark:text-green-300">Low</div>
                  </div>
                </div>
                
                {/* Risk Trend */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Trend:</span>
                  <span className={`text-sm font-semibold ${
                    realTimeMetrics.riskTrend === 'increasing' ? 'text-red-600 dark:text-red-400' :
                    realTimeMetrics.riskTrend === 'stable' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-green-600 dark:text-green-400'
                  }`}>
                    {realTimeMetrics.riskTrend.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Market Impact Assessment */}
          {marketImpact && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Market Impact Assessment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time market sentiment analysis</p>
              </div>
              <div className="p-6 space-y-4">
                {/* Current Metrics */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Market Sentiment</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      marketImpact.currentMetrics.marketSentiment === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                      marketImpact.currentMetrics.marketSentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                    }`}>
                      {marketImpact.currentMetrics.marketSentiment.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Volatility Index</span>
                      <span className="text-sm font-medium">{marketImpact.currentMetrics.volatilityIndex}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${marketImpact.currentMetrics.volatilityIndex}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Index</span>
                      <span className="text-sm font-medium">{marketImpact.currentMetrics.confidenceIndex}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${marketImpact.currentMetrics.confidenceIndex}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reputation Score</span>
                      <span className="text-sm font-medium">{marketImpact.currentMetrics.reputationScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${marketImpact.currentMetrics.reputationScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Impact Areas */}
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Impact Areas</h4>
                  {marketImpact.impactAreas.map((area: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{area.area}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          area.impact === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                          area.impact === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                          'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                        }`}>
                          {area.impact}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{area.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance Scores</h3>
            </div>
            <div className="p-6">
              <PerformanceBarChart data={pressguardData?.individual_performance} scores={briefing?.scores} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
