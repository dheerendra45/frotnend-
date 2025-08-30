import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download,
  ChevronDown,
  ChevronUp,
  Play,
  Image,
  FileText,
  BarChart3,
  Code
} from 'lucide-react';
import { getSlices, getBriefing } from '../api/client';
import { SliceRow, BriefingSummary } from '../types/api';
import { TagChip } from '../components/TagChip';
import { TimecodeRange } from '../components/Timecode';
import { JSONViewer } from '../components/JSONViewer';
import { ErrorState } from '../components/ErrorState';
import { Skeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import toast from 'react-hot-toast';

export function Slices() {
  const { id } = useParams<{ id: string }>();
  const [slices, setSlices] = useState<SliceRow[]>([]);
  const [briefing, setBriefing] = useState<BriefingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [expandedSlice, setExpandedSlice] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRiskTags, setSelectedRiskTags] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (briefingId: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const [slicesData, briefingData] = await Promise.all([
        getSlices(briefingId),
        getBriefing(briefingId)
      ]);
      setSlices(slicesData);
      setBriefing(briefingData);
      
      if (briefingData.duration_s) {
        setTimeRange([0, briefingData.duration_s]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load slices');
    } finally {
      setIsLoading(false);
    }
  };

  const allRiskTags = useMemo(() => {
    const tags = new Set<string>();
    slices.forEach(slice => {
      slice.risk_tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [slices]);

  const filteredSlices = useMemo(() => {
    return slices.filter(slice => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesTranscript = slice.transcript?.toLowerCase().includes(searchLower);
        const matchesId = slice.id.toLowerCase().includes(searchLower);
        if (!matchesTranscript && !matchesId) return false;
      }

      // Time range filter
      if (slice.t_start < timeRange[0] || slice.t_end > timeRange[1]) {
        return false;
      }

      // Risk tags filter
      if (selectedRiskTags.length > 0) {
        const hasSelectedTag = selectedRiskTags.some(tag => 
          slice.risk_tags?.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      return true;
    });
  }, [slices, searchTerm, timeRange, selectedRiskTags]);

  const handleExportSlices = () => {
    try {
      const exportData = {
        briefing_id: id,
        exported_at: new Date().toISOString(),
        total_slices: filteredSlices.length,
        slices: filteredSlices.map(slice => ({
          ...slice,
          // Clean up for export
          thumbnails: slice.thumbnails?.map(thumb => ({ url: thumb })),
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slices-${id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Slices exported successfully!');
    } catch (err) {
      toast.error('Failed to export slices');
    }
  };

  const toggleRiskTag = (tag: string) => {
    setSelectedRiskTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={() => id && fetchData(id)} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          to={`/briefings/${id}`}
          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Briefing Details
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Slice Analysis
            </h1>
            {briefing && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{slices.length} slices • {Math.floor(briefing.duration_s / 60)}m {briefing.duration_s % 60}s duration</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleExportSlices}
            disabled={filteredSlices.length === 0}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Slices ({filteredSlices.length})
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transcripts or slice IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                showFilters || selectedRiskTags.length > 0
                  ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters {selectedRiskTags.length > 0 && `(${selectedRiskTags.length})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-4">
                {/* Time Range */}
                {briefing && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Time Range: {Math.floor(timeRange[0] / 60)}:{(timeRange[0] % 60).toString().padStart(2, '0')} - {Math.floor(timeRange[1] / 60)}:{(timeRange[1] % 60).toString().padStart(2, '0')}
                    </label>
                    <div className="px-3">
                      <input
                        type="range"
                        min="0"
                        max={briefing.duration_s}
                        value={timeRange[0]}
                        onChange={(e) => setTimeRange([parseInt(e.target.value), timeRange[1]])}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min="0"
                        max={briefing.duration_s}
                        value={timeRange[1]}
                        onChange={(e) => setTimeRange([timeRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer mt-1"
                      />
                    </div>
                  </div>
                )}

                {/* Risk Tags Filter */}
                {allRiskTags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Risk Tags
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allRiskTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleRiskTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                            selectedRiskTags.includes(tag)
                              ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedRiskTags([]);
                    if (briefing) {
                      setTimeRange([0, briefing.duration_s]);
                    }
                  }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slices List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSlices.length === 0 ? (
          <EmptyState
            icon={slices.length === 0 ? FileText : Search}
            title={slices.length === 0 ? "No slices available" : "No matching slices"}
            description={
              slices.length === 0
                ? "This briefing doesn't have any slice data available"
                : "Try adjusting your search criteria or filters"
            }
          />
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredSlices.length} of {slices.length} slices
              </p>
            </div>

            {/* Slices */}
            {filteredSlices.map((slice) => (
              <div key={slice.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                {/* Slice Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setExpandedSlice(expandedSlice === slice.id ? null : slice.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <TimecodeRange startSeconds={slice.t_start} endSeconds={slice.t_end} />
                    <div className="flex items-center space-x-2">
                      <Play className="h-4 w-4 text-gray-400" />
                      {expandedSlice === slice.id ? (
                        <ChevronUp className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2">
                      {slice.transcript || 'No transcript available'}
                    </p>
                  </div>

                  {slice.risk_tags && slice.risk_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {slice.risk_tags.map((tag, index) => (
                        <TagChip key={index} tag={tag} variant="risk" size="sm" />
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>ID: {slice.id.slice(0, 8)}...</span>
                    {slice.thumbnails && slice.thumbnails.length > 0 && (
                      <span className="flex items-center">
                        <Image className="mr-1 h-3 w-3" />
                        {slice.thumbnails.length} thumbnails
                      </span>
                    )}
                    {slice.metrics && Object.keys(slice.metrics).length > 0 && (
                      <span className="flex items-center">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        {Object.keys(slice.metrics).length} metrics
                      </span>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedSlice === slice.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Full Transcript */}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Full Transcript
                        </h3>
                        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {slice.transcript || 'No transcript available'}
                          </p>
                        </div>
                      </div>

                      {/* Metrics */}
                      {slice.metrics && Object.keys(slice.metrics).length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Metrics
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                            <div className="grid grid-cols-1 gap-2">
                              {Object.entries(slice.metrics).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">{key}:</span>
                                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* AU Signals */}
                      {slice.au_signals && Object.keys(slice.au_signals).length > 0 && (
                        <div className="lg:col-span-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                            AU Signals
                          </h3>
                          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {Object.entries(slice.au_signals).map(([key, value]) => (
                                <div key={key} className="text-center">
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{key}</div>
                                  <div className="text-sm font-mono text-gray-900 dark:text-white">
                                    {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Thumbnails */}
                      {slice.thumbnails && slice.thumbnails.length > 0 && (
                        <div className="lg:col-span-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                            <Image className="mr-2 h-4 w-4" />
                            Thumbnails ({slice.thumbnails.length})
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {slice.thumbnails.map((thumbnail, index) => (
                              <div key={index} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                                <img
                                  src={thumbnail}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-full h-full flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                                  <Image className="h-6 w-6" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Raw JSON */}
                      <div className="lg:col-span-2">
                        <JSONViewer 
                          data={slice} 
                          title={`Slice ${slice.id.slice(0, 8)}... Raw Data`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}