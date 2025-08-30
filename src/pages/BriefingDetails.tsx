import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Code,
  Shield
} from 'lucide-react';
import { getBriefing } from '../api/client';
import { BriefingSummary } from '../types/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { ScoreRadarChart } from '../components/ScoreRadarChart';
import { TagChip } from '../components/TagChip';
import { TimecodeRange } from '../components/Timecode';
import { JSONViewer } from '../components/JSONViewer';
import { ErrorState } from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { AIInsights } from '../components/AIInsights';
import { format } from 'date-fns';

export function BriefingDetails() {
  const { id } = useParams<{ id: string }>();
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawData, setShowRawData] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBriefing(id);
    }
  }, [id]);

  const fetchBriefing = async (briefingId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getBriefing(briefingId);
      setBriefing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load briefing');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={() => id && fetchBriefing(id)} />
      </div>
    );
  }

  if (isLoading || !briefing) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8 animate-pulse">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-6" />
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border animate-pulse">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full rounded-full" />
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border animate-pulse">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/briefings"
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Briefings
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Briefing Details
            </h1>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">ID:</span> {briefing.id}</p>
              <p><span className="font-medium">Created:</span> {format(new Date(briefing.created_at), 'MMM d, yyyy h:mm a')}</p>
              <p><span className="font-medium">Duration:</span> {Math.floor(briefing.duration_s / 60)}m {briefing.duration_s % 60}s</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            <Link
              to={`/briefings/${briefing.id}/slices`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Eye className="mr-2 h-4 w-4" />
              View Slices
            </Link>

            <Link
              to={`/briefings/${briefing.id}/pressguard`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Shield className="mr-2 h-4 w-4" />
              PressGuard Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Video Source */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <ExternalLink className="mr-2 h-5 w-5" />
            Video Source
          </h2>
          <div className="break-all text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
            {briefing.video_src}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analysis Scores
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <ScoreBadge label="Content" score={briefing.scores.content} size="lg" />
              <ScoreBadge label="Delivery" score={briefing.scores.delivery} size="lg" />
              <ScoreBadge label="Impact" score={briefing.scores.impact} size="lg" />
              <ScoreBadge label="Composite" score={briefing.scores.composite} size="lg" />
            </div>

            <div className="h-64">
              <ScoreRadarChart scores={briefing.scores} />
            </div>
          </div>

          {/* Volatility */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Score Volatility
            </h2>

            <div className="space-y-4">
              {Object.entries(briefing.volatility).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {value.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(value * 10, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {briefing.ai && (
          <AIInsights ai={briefing.ai} />
        )}

        {/* Highlights */}
        {briefing.highlights && briefing.highlights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Highlights & Risk Points
            </h2>

            <div className="space-y-4">
              {briefing.highlights.map((highlight, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <TimecodeRange startSeconds={highlight.t_start} endSeconds={highlight.t_end} />
                  </div>

                  {highlight.risk_tags && highlight.risk_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {highlight.risk_tags.map((tag, tagIndex) => (
                        <TagChip key={tagIndex} tag={tag} variant="risk" size="sm" />
                      ))}
                    </div>
                  )}

                  {highlight.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {highlight.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Raw Data Toggle */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Code className="mr-2 h-5 w-5" />
              Raw Data
            </h2>
            <button
              onClick={() => setShowRawData(!showRawData)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showRawData ? 'Hide' : 'Show'} JSON
            </button>
          </div>

          {showRawData && (
            <JSONViewer data={briefing} title="Full Briefing Data" />
          )}
        </div>
      </div>
    </div>
  );
}