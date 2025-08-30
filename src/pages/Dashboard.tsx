import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Activity } from 'lucide-react';
import { listBriefings } from '../api/client';
import { BriefingListItem } from '../types/api';
import { GlowingButton } from '../components/GlowingButton';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ScoreBadge } from '../components/ScoreBadge';
import { MetricsGrid } from '../components/MetricsGrid';
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

      

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Briefings */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
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
      </div>
    </div>
  );
}