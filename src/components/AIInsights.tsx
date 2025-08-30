import React from 'react';
import { User, TrendingUp, Lightbulb } from 'lucide-react';

interface AIInsightsProps {
  ai: any | undefined | null;
}

export function AIInsights({ ai }: AIInsightsProps) {
  if (!ai) return null;

  const speaker = ai?.speaker;
  const sentiment = ai?.sentiment;
  const marketImpact = ai?.market_impact;
  const suggestions = ai?.suggestions;

  const fmtPct = (n?: number | null) =>
    typeof n === 'number' ? `${Math.round(n * 100)}%` : '—';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <h2 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h2>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Speaker */}
        {speaker && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Speaker</h3>
            {typeof speaker === 'string' ? (
              <p className="text-gray-900 dark:text-white">{speaker}</p>
            ) : (
              <div className="space-y-1 text-sm">
                {speaker?.name && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Name</span>
                    <span className="text-gray-900 dark:text-white font-medium">{speaker.name}</span>
                  </div>
                )}
                {(speaker?.role || speaker?.organization) && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Role / Org</span>
                    <span className="text-gray-900 dark:text-white">
                      {[speaker.role, speaker.organization].filter(Boolean).join(' • ') || '—'}
                    </span>
                  </div>
                )}
                {speaker?.confidence !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                      <span className="text-gray-900 dark:text-white font-mono">{fmtPct(speaker.confidence)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${Math.min(Math.max((speaker.confidence || 0) * 100, 0), 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sentiment */}
        {sentiment && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sentiment Analysis</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Label</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold 
                    ${sentiment.label?.toLowerCase() === 'bullish' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' : ''}
                    ${sentiment.label?.toLowerCase() === 'bearish' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' : ''}
                    ${sentiment.label?.toLowerCase() === 'neutral' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' : ''}
                  `}
                >
                  {sentiment.label || '—'}
                </span>
              </div>
              {sentiment.confidence !== undefined && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                    <span className="text-gray-900 dark:text-white font-mono">{fmtPct(sentiment.confidence)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${Math.min(Math.max((sentiment.confidence || 0) * 100, 0), 100)}%` }}
                    />
                  </div>
                </div>
              )}
              {sentiment.rationale && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mt-2">{sentiment.rationale}</p>
              )}
            </div>
          </div>
        )}

        {/* Market Impact */}
        {marketImpact && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" /> Market Impact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sectors */}
              {Array.isArray(marketImpact.sectors) && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Sectors</p>
                  <div className="flex flex-wrap gap-1">
                    {marketImpact.sectors.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Risk Channels */}
              {Array.isArray(marketImpact.risk_channels) && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Risk Channels</p>
                  <div className="flex flex-wrap gap-1">
                    {marketImpact.risk_channels.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Affected Parties */}
              {Array.isArray(marketImpact.affected_parties) && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Affected Parties</p>
                  <div className="flex flex-wrap gap-1">
                    {marketImpact.affected_parties.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-full text-xs bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {marketImpact.rationale && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-4">{marketImpact.rationale}</p>
            )}
          </div>
        )}

        {/* Suggestions */}
        {suggestions && (
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" /> Suggestions
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {suggestions.type || '—'}
                </span>
              </div>
              {suggestions.guide && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{suggestions.guide}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
