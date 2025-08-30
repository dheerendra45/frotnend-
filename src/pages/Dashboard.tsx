import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Activity, Zap } from 'lucide-react';
import { listBriefings } from '../api/client';
import { BriefingListItem } from '../types/api';
import { GlowingButton } from '../components/GlowingButton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { MetricsGrid } from '../components/MetricsGrid';
import { MarketReaction } from '../components/MarketReaction';
import { Skeleton } from '../components/Skeleton';
import { format } from 'date-fns';

export function Dashboard() {
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBriefings();
  }, []);

  const fetchBriefings = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await listBriefings();
      setBriefings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load briefings');
    } finally {
      setIsLoading(false);
    }
  };

  const recentBriefings = briefings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={fetchBriefings} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-white mb-4 font-display bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-glow">
          AttackedAI Dashboard
        </h1>
        <p className="text-xl text-gray-300 font-medium">
          Advanced Briefing Intelligence & Market Analysis Platform
        </p>
      </div>

      {/* Video-derived key metrics */}
      <MetricsGrid briefings={briefings} />

      
      {/* Speech-driven Market Reaction (video-based, no live market feeds) */}
      <div className="grid grid-cols-1 gap-8">
        <MarketReaction recentBriefings={briefings} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Briefings */}
        <div className="xl:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white font-display flex items-center">
                <Activity className="mr-3 h-6 w-6 text-blue-400" />
                Recent Briefings
              </h2>
              <GlowingButton variant="primary" size="sm">
                <Link to="/briefings" className="block">
                  View all
                </Link>
              </GlowingButton>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-3 w-full mb-3" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBriefings.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No briefings yet"
                description="Upload your first video or URL to get started with analysis"
                action={
                  <GlowingButton variant="primary" size="md">
                    <Link to="/upload" className="inline-flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Now
                    </Link>
                  </GlowingButton>
                }
              />
            ) : (
              <div className="space-y-4">
                {recentBriefings.map((briefing) => (
                  <Link
                    key={briefing.id}
                    to={`/briefings/${briefing.id}`}
                    className="block p-4 border border-gray-700 rounded-lg hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-gradient-to-r from-gray-800/30 to-gray-700/30 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          ID: {briefing.id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-gray-300 mt-1">
                          {format(new Date(briefing.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                        <div className="flex space-x-2 mt-2">
                          <ScoreBadge
                            label="C"
                            score={briefing.scores.content || 0}
                            size="sm"
                            showLabel={true}
                          />
                          <ScoreBadge
                            label="D"
                            score={briefing.scores.delivery || 0}
                            size="sm"
                            showLabel={true}
                          />
                          <ScoreBadge
                            label="I"
                            score={briefing.scores.impact || 0}
                            size="sm"
                            showLabel={true}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Score Visualization */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white font-display flex items-center">
              <Zap className="mr-3 h-6 w-6 text-yellow-400" />
              Average Scores
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-pulse">
                  <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
              </div>
            ) : briefings.length === 0 ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-400">
                    No data to display
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-64">
                <ScoreRadarChart
                  scores={{
                    content: briefings.reduce((sum, b) => sum + (b.scores.content || 0), 0) / briefings.length,
                    delivery: briefings.reduce((sum, b) => sum + (b.scores.delivery || 0), 0) / briefings.length,
                    impact: briefings.reduce((sum, b) => sum + (b.scores.impact || 0), 0) / briefings.length,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}