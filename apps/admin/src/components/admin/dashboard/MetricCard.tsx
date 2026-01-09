'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
  href?: string;
}

export function MetricCard({
  title,
  value,
  previousValue,
  icon,
  isLoading = false,
  href,
}: MetricCardProps) {
  // Calculate trend
  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  let percentChange: number | null = null;

  if (typeof value === 'number' && previousValue !== undefined && previousValue > 0) {
    percentChange = Math.round(((value - previousValue) / previousValue) * 100);
    trend = percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral';
  }

  if (isLoading) {
    return (
      <Card className="p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </Card>
    );
  }

  const content = (
    <Card className={cn(
      "p-6 border border-gray-100 shadow-sm transition-all duration-200",
      href && "hover:shadow-md hover:border-gray-200 cursor-pointer"
    )}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {percentChange !== null && (
            <div className="flex items-center gap-1">
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
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}
