'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PlanSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-32 mt-2 sm:mt-0" />
      </div>

      {/* Program type */}
      <Skeleton className="h-5 w-48" />

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </Card>

          <Card className="p-5">
            <Skeleton className="h-5 w-32 mb-4" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </Card>

          <Card className="p-5 bg-amber-50">
            <Skeleton className="h-5 w-28 mb-3 bg-amber-200/50" />
            <Skeleton className="h-4 w-full mb-2 bg-amber-200/50" />
            <Skeleton className="h-4 w-5/6 bg-amber-200/50" />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-5 w-28" />
            </div>
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-4 w-10" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
              </div>
            ))}
          </Card>

          <Card className="p-5 bg-green-50">
            <div className="flex items-center gap-2 mb-4">
              <Skeleton className="h-5 w-5 bg-green-200/50" />
              <Skeleton className="h-5 w-40 bg-green-200/50" />
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-3">
                <Skeleton className="h-2 w-2 rounded-full mt-2 bg-green-200/50" />
                <Skeleton className="h-4 w-full bg-green-200/50" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
