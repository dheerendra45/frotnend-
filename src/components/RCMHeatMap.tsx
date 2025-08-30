import { useState, useEffect } from 'react';

interface RiskItem {
  id: string;
  name: string;
  probability: number; // 1-5 scale
  impact: number; // 1-5 scale
  riskScore: number;
  category: string;
  controls: string[];
  mitigation: string;
  owner: string;
  status: 'Open' | 'Mitigated' | 'Accepted' | 'Transferred';
}

interface RCMHeatMapProps {
  risks?: RiskItem[];
  title?: string;
}

export function RCMHeatMap({ risks, title = "Risk and Control Matrix" }: RCMHeatMapProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);
  const [riskData, setRiskData] = useState<RiskItem[]>([]);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; lines: string[] }>({ visible: false, x: 0, y: 0, lines: [] });
  const [heatmapView, setHeatmapView] = useState<'matrix' | 'timeline' | 'impact'>('matrix');

  useEffect(() => {
    if (!risks || risks.length === 0) {
      const defaultRisks: RiskItem[] = [
        {
          id: 'R001',
          name: 'Communication Clarity Risk',
          probability: 3,
          impact: 4,
          riskScore: 12,
          category: 'Communication',
          controls: ['Regular training', 'Message review process'],
          mitigation: 'Implement structured communication protocols',
          owner: 'Communications Team',
          status: 'Open'
        },
        {
          id: 'R002',
          name: 'Stakeholder Perception Risk',
          probability: 4,
          impact: 4,
          riskScore: 16,
          category: 'Reputation',
          controls: ['Stakeholder feedback system', 'Regular surveys'],
          mitigation: 'Proactive stakeholder engagement',
          owner: 'PR Team',
          status: 'Mitigated'
        },
        {
          id: 'R003',
          name: 'Media Response Risk',
          probability: 2,
          impact: 5,
          riskScore: 10,
          category: 'Media',
          controls: ['Media monitoring', 'Response protocols'],
          mitigation: 'Prepare standard response templates',
          owner: 'Media Relations',
          status: 'Open'
        }
      ];
      setRiskData(defaultRisks);
    } else {
      setRiskData(risks);
    }
  }, [risks]);

  if (!riskData || riskData.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400">No risk data available</div>
      </div>
    );
  }

  const getRiskColor = (probability: number, impact: number) => {
    const score = probability * impact; // 1..25
    const t = Math.min(1, Math.max(0, (score - 1) / 24));
    const hue = 120 - 120 * t;
    const color = `hsl(${hue}, 85%, ${35 + 10 * (1 - t)}%)`;
    return color;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 16) return 'Critical';
    if (score >= 12) return 'High';
    if (score >= 8) return 'Medium';
    if (score >= 4) return 'Low';
    return 'Very Low';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-red-400';
      case 'Mitigated': return 'text-green-400';
      case 'Accepted': return 'text-yellow-400';
      case 'Transferred': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="text-sm text-gray-400">
          Total Risks: {riskData.length} | Avg Score: {(riskData.reduce((sum, r) => sum + r.riskScore, 0) / riskData.length).toFixed(1)}
        </div>
      </div>

      {heatmapView === 'matrix' && (
        <div className="bg-gray-800 rounded-lg p-4 relative">
          {/* Y-axis labels (Impact) */}
          <div className="grid grid-cols-6 gap-1 mb-2">
            <div className="text-xs text-gray-400 text-center">Impact →</div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="text-xs text-gray-400 text-center font-medium">{i}</div>
            ))}
          </div>

          {/* X-axis label (Probability) */}
          <div className="absolute left-2 top-1/2 transform -rotate-90 text-xs text-gray-400 font-medium">
            ← Probability
          </div>

          {/* Matrix Grid */}
          {[5, 4, 3, 2, 1].map(probability => (
            <div key={probability} className="grid grid-cols-6 gap-1 mb-1">
              <div className="text-xs text-gray-400 text-center font-medium">{probability}</div>
              {[1, 2, 3, 4, 5].map(impact => {
                const cellRisks = riskData.filter(r => r.probability === probability && r.impact === impact);
                return (
                  <div
                    key={`${probability}-${impact}`}
                    className={`h-12 w-12 rounded border border-gray-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:scale-110 transition-transform`}
                    style={{ backgroundColor: getRiskColor(probability, impact) }}
                    onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                    onMouseEnter={(e) => {
                      if (cellRisks.length > 0) {
                        const rect = (e.target as HTMLElement).getBoundingClientRect();
                        setTooltip({
                          visible: true,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          lines: cellRisks.map(r => `${r.name} (P:${r.probability}, I:${r.impact}, S:${r.riskScore})`)
                        });
                      }
                    }}
                    onMouseMove={(e) => {
                      if (tooltip.visible) {
                        setTooltip(prev => ({ ...prev, x: e.clientX + 10, y: e.clientY + 10 }));
                      }
                    }}
                    onMouseLeave={() => setTooltip({ visible: false, x: 0, y: 0, lines: [] })}
                  >
                    {cellRisks.length > 0 ? cellRisks.length : ''}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="mt-4">
            <div className="text-xs text-gray-300 mb-2">Risk Score Scale</div>
            <div className="h-3 w-full rounded bg-gradient-to-r from-green-500 via-yellow-400 to-red-600" />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>1</span>
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
            </div>
          </div>
        </div>
      )}

      {/* Risk List View */}
      {heatmapView === 'impact' && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white mb-4">Risk Impact Analysis</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {riskData.map(risk => (
              <div
                key={risk.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedRisk?.id === risk.id 
                    ? 'border-blue-500 bg-blue-900/20' 
                    : 'border-gray-600 bg-gray-800/50'
                }`}
                onClick={() => setSelectedRisk(risk)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{risk.id}: {risk.name}</span>
                  <span className={`text-xs font-medium ${getStatusColor(risk.status)}`}>
                    {risk.status}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-300">
                  <span>P: {risk.probability}</span>
                  <span>I: {risk.impact}</span>
                  <span className={`font-bold ${
                    risk.riskScore >= 16 ? 'text-red-400' :
                    risk.riskScore >= 12 ? 'text-red-300' :
                    risk.riskScore >= 8 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    Score: {risk.riskScore} ({getRiskLevel(risk.riskScore)})
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Category: {risk.category} | Owner: {risk.owner}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline View */}
      {heatmapView === 'timeline' && (
        <div className="space-y-3">
          <h4 className="text-lg font-semibold text-white mb-4">Risk Timeline Heatmap</h4>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-3">
              {['0-30 days', '30-90 days', '90-180 days', '180+ days'].map((period) => (
                <div key={period} className="flex items-center space-x-4">
                  <div className="w-20 text-xs text-gray-400">{period}</div>
                  <div className="flex-1 flex space-x-1">
                    {riskData.map((risk) => (
                      <div
                        key={risk.id}
                        className="h-6 flex-1 rounded cursor-pointer"
                        style={{ backgroundColor: getRiskColor(risk.probability, risk.impact) }}
                        onClick={() => setSelectedRisk(risk)}
                        title={`${risk.name} - Score: ${risk.riskScore}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex justify-center space-x-2 mt-4">
        {(['matrix', 'timeline', 'impact'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setHeatmapView(view)}
            className={`px-3 py-1 text-xs rounded ${
              heatmapView === view
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Risk Details Panel */}
      {selectedRisk && (
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <h4 className="text-lg font-semibold text-white mb-3">
            {selectedRisk.id}: {selectedRisk.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Probability:</span> {selectedRisk.probability}
            </div>
            <div>
              <span className="text-gray-400">Impact:</span> {selectedRisk.impact}
            </div>
            <div>
              <span className="text-gray-400">Risk Score:</span> {selectedRisk.riskScore} ({getRiskLevel(selectedRisk.riskScore)})
            </div>
            <div>
              <span className="text-gray-400">Category:</span> {selectedRisk.category}
            </div>
            <div>
              <span className="text-gray-400">Owner:</span> {selectedRisk.owner}
            </div>
            <div>
              <span className={`text-gray-400`}>Status:</span> 
              <span className={`ml-1 ${getStatusColor(selectedRisk.status)}`}>
                {selectedRisk.status}
              </span>
            </div>
          </div>
          {selectedRisk.mitigation && (
            <div className="mt-3">
              <span className="text-gray-400">Mitigation:</span>
              <p className="text-gray-300 text-sm mt-1">{selectedRisk.mitigation}</p>
            </div>
          )}
          {selectedRisk.controls && selectedRisk.controls.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-400">Controls:</span>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-1">
                {selectedRisk.controls.map((control, idx) => (
                  <li key={idx}>{control}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="fixed z-50 bg-gray-900 text-white text-xs p-2 rounded shadow-lg pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.lines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
