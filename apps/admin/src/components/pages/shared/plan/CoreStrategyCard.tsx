'use client';

import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface CoreStrategyCardProps {
  description?: string;
  isLoading?: boolean;
}

export function CoreStrategyCard({ description, isLoading = false }: CoreStrategyCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (!description) {
    return null;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-5 w-5 text-[hsl(var(--sidebar-accent))]" />
        <h3 className="font-semibold text-foreground">Core Strategy</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </Card>
  );
}
