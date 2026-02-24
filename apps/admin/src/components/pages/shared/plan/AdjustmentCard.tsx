'use client';

import { Card } from '@/components/ui/card';

interface AdjustmentCardProps {
  description?: string;
  isLoading?: boolean;
}

export function AdjustmentCard({ description, isLoading = false }: AdjustmentCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 bg-amber-50 border-amber-200 animate-pulse">
        <div className="h-5 w-32 bg-amber-200/50 rounded mb-3" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-amber-200/50 rounded" />
          <div className="h-4 w-5/6 bg-amber-200/50 rounded" />
        </div>
      </Card>
    );
  }

  if (!description) {
    return null;
  }

  return (
    <Card className="p-5 bg-amber-50 border-amber-200">
      <h3 className="font-semibold text-amber-800 mb-3">When We Adjust</h3>
      <p className="text-sm text-amber-700 leading-relaxed">{description}</p>
    </Card>
  );
}
