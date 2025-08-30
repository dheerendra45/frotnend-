import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, FileText, Calendar, BarChart3 } from 'lucide-react';
import { listBriefings } from '../api/client';
import { BriefingListItem } from '../types/api';
import { ScoreBadge } from '../components/ScoreBadge';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { SkeletonCard } from '../components/Skeleton';
import { format } from 'date-fns';

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  minComposite: number;
  maxComposite: number;
  minContent: number;
  maxContent: number;
  minDelivery: number;
  maxDelivery: number;
  minImpact: number;
  maxImpact: number;
}

export function Briefings() {
  const [briefings, setBriefings] = useState<BriefingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'composite'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    minComposite: 0,
    maxComposite: 10,
    minContent: 0,
    maxContent: 10,
    minDelivery: 0,
    maxDelivery: 10,
    minImpact: 0,
    maxImpact: 10,
  });

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

  const filteredAndSortedBriefings = useMemo(() => {
    let filtered = briefings.filter(briefing => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesId = briefing.id.toLowerCase().includes(searchLower);
        const matchesVideoSrc = briefing.video_src.toLowerCase().includes(searchLower);
        if (!matchesId && !matchesVideoSrc) return false;
      }

      // Date filters
      if (filters.dateFrom) {
        const briefingDate = new Date(briefing.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (briefingDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const briefingDate = new Date(briefing.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (briefingDate > toDate) return false;
      }

      // Score filters
      const composite = briefing.scores.composite || 0;
      const content = briefing.scores.content || 0;
      const delivery = briefing.scores.delivery || 0;
      const impact = briefing.scores.impact || 0;

      return composite >= filters.minComposite && composite <= filters.maxComposite &&
             content >= filters.minContent && content <= filters.maxContent &&
             delivery >= filters.minDelivery && delivery <= filters.maxDelivery &&
             impact >= filters.minImpact && impact <= filters.maxImpact;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortBy === 'composite') {
        comparison = (a.scores.composite || 0) - (b.scores.composite || 0);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [briefings, filters, sortBy, sortOrder]);

  const handleFilterChange = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
      minComposite: 0,
      maxComposite: 10,
      minContent: 0,
      maxContent: 10,
      minDelivery: 0,
      maxDelivery: 10,
      minImpact: 0,
      maxImpact: 10,
    });
  };

  if (error) {
    return (
      <div className="p-8">
        <ErrorState message={error} onRetry={fetchBriefings} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Briefings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and filter your analyzed briefings
        </p>
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
                  placeholder="Search by ID or video source..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'composite', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="composite-desc">Highest Score</option>
                <option value="composite-asc">Lowest Score</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showFilters
                    ? 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-200'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date Filters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Score Range Filters */}
                {(['composite', 'content', 'delivery', 'impact'] as const).map((scoreType) => (
                  <div key={scoreType} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {scoreType.charAt(0).toUpperCase() + scoreType.slice(1)} Score
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters[`min${scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}` as keyof Filters] as number}
                        onChange={(e) => handleFilterChange(`min${scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}` as keyof Filters, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <span className="text-gray-500 dark:text-gray-400">to</span>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters[`max${scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}` as keyof Filters] as number}
                        onChange={(e) => handleFilterChange(`max${scoreType.charAt(0).toUpperCase() + scoreType.slice(1)}` as keyof Filters, parseFloat(e.target.value) || 10)}
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredAndSortedBriefings.length === 0 ? (
          <EmptyState
            icon={briefings.length === 0 ? FileText : Search}
            title={briefings.length === 0 ? "No briefings yet" : "No matching briefings"}
            description={
              briefings.length === 0
                ? "Upload your first video or URL to get started with analysis"
                : "Try adjusting your search or filter criteria"
            }
            action={
              briefings.length === 0 ? (
                <Link
                  to="/upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                >
                  Upload Now
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAndSortedBriefings.length} of {briefings.length} briefings
              </p>
            </div>

            {/* Briefings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedBriefings.map((briefing) => (
                <Link
                  key={briefing.id}
                  to={`/briefings/${briefing.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                        ID: {briefing.id.slice(0, 8)}...
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(briefing.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                      {briefing.video_src}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <ScoreBadge
                      label="Content"
                      score={briefing.scores.content || 0}
                      size="sm"
                    />
                    <ScoreBadge
                      label="Delivery"
                      score={briefing.scores.delivery || 0}
                      size="sm"
                    />
                    <ScoreBadge
                      label="Impact"
                      score={briefing.scores.impact || 0}
                      size="sm"
                    />
                    <ScoreBadge
                      label="Composite"
                      score={briefing.scores.composite || 0}
                      size="sm"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}