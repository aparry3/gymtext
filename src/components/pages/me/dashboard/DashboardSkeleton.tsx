'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-32 mt-2 sm:mt-0" />
      </div>

      {/* Today's Mission section */}
      <div>
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main workout card */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-gradient-to-br from-[hsl(213,94%,58%)] to-[hsl(213,94%,48%)] p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 w-20 bg-white/20 rounded" />
                <div className="h-10 w-3/4 bg-white/20 rounded" />
                <div className="h-10 w-40 bg-white/20 rounded" />
                <div className="h-4 w-64 bg-white/20 rounded mt-6" />
              </div>
            </div>
          </div>

          {/* Sidebar cards */}
          <div className="space-y-4">
            <Card className="p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-3 w-full" />
            </Card>

            <Card className="p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-24" />
            </Card>

            <Card className="p-4 bg-[hsl(143,85%,42%)]">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24 bg-white/20" />
                  <Skeleton className="h-3 w-32 bg-white/20" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
