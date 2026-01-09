'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PageVisitsCardProps {
  totalThisWeek: number;
  totalLastWeek: number;
  bySource: Array<{ source: string | null; count: number }>;
  isLoading?: boolean;
}

export function PageVisitsCard({
  totalThisWeek,
  totalLastWeek,
  bySource,
  isLoading = false,
}: PageVisitsCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100 shadow-sm">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let percentChange = 0;

  if (totalLastWeek > 0) {
    percentChange = Math.round(
      ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100
    );
    trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
  }

  // Top sources (max 5)
  const topSources = bySource.slice(0, 5);

  return (
    <Card className="p-6 border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Visits</h3>

      <div className="mb-6">
        <p className="text-2xl font-semibold text-gray-900">
          {totalThisWeek.toLocaleString()}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {trend === 'up' && (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">+{percentChange}%</span>
            </>
          )}
          {trend === 'down' && (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{percentChange}%</span>
            </>
          )}
          {trend === 'neutral' && (
            <>
              <Minus className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">0%</span>
            </>
          )}
          <span className="text-sm text-gray-400 ml-1">vs last week</span>
        </div>
      </div>

      {topSources.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-500 mb-3">Top Sources</p>
          <div className="space-y-2">
            {topSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {source.source || 'Direct'}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {source.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {topSources.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No visit data available
        </p>
      )}
    </Card>
  );
}
