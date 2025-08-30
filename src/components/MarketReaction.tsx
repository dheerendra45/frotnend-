import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { BriefingListItem, BriefingSummary } from '../types/api';
import { getBriefing } from '../api/client';

interface MarketReactionProps {
  briefingId?: string;
  recentBriefings?: BriefingListItem[];
}

interface ReactionState {
  label: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number; // 0..1
  source: 'AI' | 'Heuristic' | 'None';
  rationale?: string;
  loading: boolean;
  error?: string | null;
}

function normalizeToMinusOneToOne(score: number, maxDetected: number): number {
  const mid = maxDetected / 2;
  if (maxDetected <= 0) return 0;
  return Math.max(-1, Math.min(1, (score - mid) / mid));
}

function computeHeuristicFromScores(
  scores: Record<string, number> | undefined
): { label: ReactionState['label']; confidence: number; rationale: string } {
  if (!scores) return { label: 'Neutral', confidence: 0, rationale: 'No scores available' };

  const c = typeof scores.content === 'number' ? scores.content : 0;
  const d = typeof scores.delivery === 'number' ? scores.delivery : 0;
  const i = typeof scores.impact === 'number' ? scores.impact : 0;
  const comp = typeof (scores as any).composite === 'number' ? (scores as any).composite : undefined;

  const maxDetected = Math.max(5, c, d, i, comp ?? 0) > 5 ? 10 : 5; // infer 0..10 vs 0..5 scale
  const nc = normalizeToMinusOneToOne(c, maxDetected);
  const nd = normalizeToMinusOneToOne(d, maxDetected);
  const ni = normalizeToMinusOneToOne(i, maxDetected);
  const ncomp = typeof comp === 'number' ? normalizeToMinusOneToOne(comp, maxDetected) : undefined;

  // Weighted blend prioritizing delivery and impact for market-reaction, with optional composite boost
  let raw = 0.3 * nc + 0.4 * nd + 0.3 * ni;
  if (typeof ncomp === 'number' && !isNaN(ncomp)) {
    raw = 0.7 * raw + 0.3 * ncomp;
  }

  const confidence = Math.min(1, Math.abs(raw));
  const label = raw > 0.02 ? 'Bullish' : raw < -0.02 ? 'Bearish' : 'Neutral';
  const rationale = 'Heuristic blend of content, delivery, impact' + (ncomp !== undefined ? ' + composite' : '');
  return { label, confidence, rationale };
}

export function MarketReaction({ briefingId, recentBriefings }: MarketReactionProps) {
  const [state, setState] = useState<ReactionState>({
    label: 'Neutral',
    confidence: 0,
    source: 'None',
    loading: true,
    rationale: undefined,
    error: null,
  });

  const latestId = useMemo(() => {
    if (briefingId) return briefingId;
    if (recentBriefings && recentBriefings.length > 0) {
      return recentBriefings
        .slice()
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].id;
    }
    return undefined;
  }, [briefingId, recentBriefings]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        if (!latestId) {
          const heuristic = computeHeuristicFromScores(recentBriefings && recentBriefings[0]?.scores);
          if (!cancelled) {
            setState({ label: heuristic.label, confidence: heuristic.confidence, source: 'Heuristic', rationale: heuristic.rationale, loading: false, error: null });
          }
          return;
        }

        const summary: BriefingSummary = await getBriefing(latestId);
        const ai = summary.ai || {} as any;
        const sentiment = ai?.sentiment;

        if (sentiment && (sentiment.label === 'Bullish' || sentiment.label === 'Bearish')) {
          const confidence = typeof sentiment.confidence === 'number' ? Math.max(0, Math.min(1, sentiment.confidence)) : 0.5;
          const label: ReactionState['label'] = sentiment.label === 'Bullish' ? 'Bullish' : 'Bearish';
          if (!cancelled) {
            setState({
              label,
              confidence,
              source: 'AI',
              rationale: typeof sentiment.rationale === 'string' ? sentiment.rationale : undefined,
              loading: false,
              error: null,
            });
          }
          return;
        }

        // Fallback to heuristic based on aggregate scores
        const heuristic = computeHeuristicFromScores(summary.scores as any);
        if (!cancelled) {
          setState({ label: heuristic.label, confidence: heuristic.confidence, source: 'Heuristic', rationale: heuristic.rationale, loading: false, error: null });
        }
      } catch (err: any) {
        const heuristic = computeHeuristicFromScores(recentBriefings && recentBriefings[0]?.scores);
        if (!cancelled) {
          setState({
            label: heuristic.label,
            confidence: heuristic.confidence,
            source: 'Heuristic',
            rationale: heuristic.rationale,
            loading: false,
            error: err?.message || 'Failed to load market reaction',
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [latestId, recentBriefings]);

  const Icon = state.label === 'Bullish' ? TrendingUp : state.label === 'Bearish' ? TrendingDown : AlertTriangle;
  const color = state.label === 'Bullish' ? 'text-green-400' : state.label === 'Bearish' ? 'text-red-400' : 'text-yellow-400';
  const bgColor = state.label === 'Bullish' ? 'from-green-900/40 to-emerald-900/30' : state.label === 'Bearish' ? 'from-red-900/40 to-rose-900/30' : 'from-yellow-900/40 to-amber-900/30';
  const borderColor = state.label === 'Bullish' ? 'border-green-700/60' : state.label === 'Bearish' ? 'border-red-700/60' : 'border-yellow-700/60';

  return (
    <div className={`rounded-xl border ${borderColor} bg-gradient-to-br ${bgColor} shadow-2xl`}> 
      <div className="p-6 border-b border-gray-700/60">
        <h2 className="text-2xl font-bold text-white font-display flex items-center">
          <Icon className={`mr-3 h-6 w-6 ${color}`} />
          Market Reaction (Speech-Driven)
        </h2>
      </div>

      <div className="p-6">
        {state.loading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="animate-pulse w-32 h-6 bg-gray-700/50 rounded" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <Icon className={`h-10 w-10 ${color}`} />
                <div>
                  <div className="text-lg text-gray-300">Predicted Direction</div>
                  <div className="text-3xl font-extrabold text-white">{state.label}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-300">
                Confidence: <span className="font-semibold text-white">{Math.round(state.confidence * 100)}%</span>
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs border border-gray-600 text-gray-300">{state.source}</span>
              </div>
              {state.rationale && (
                <div className="mt-3 text-sm text-gray-400">
                  {state.rationale}
                </div>
              )}
              {state.error && (
                <div className="mt-2 text-xs text-red-300">{state.error}</div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-wide text-gray-400">Latest Briefing</div>
              <div className="mt-1 text-sm text-gray-300">{latestId ? latestId.slice(0, 8) + '...' : 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
