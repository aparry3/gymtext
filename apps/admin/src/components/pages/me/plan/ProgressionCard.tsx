'use client';

import { Card } from '@/components/ui/card';

interface ProgressionCardProps {
  strategies?: string[];
  isLoading?: boolean;
}

export function ProgressionCard({ strategies = [], isLoading = false }: ProgressionCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="h-5 w-32 bg-muted rounded mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-2">
              <div className="h-2 w-2 bg-muted rounded-full mt-2" />
              <div className="h-4 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (strategies.length === 0) {
    return null;
  }

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-foreground mb-4">How You Progress</h3>
      <ul className="space-y-3">
        {strategies.map((strategy, index) => (
          <li key={index} className="flex gap-3 text-sm">
            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[hsl(var(--sidebar-accent))] mt-2" />
            <span className="text-muted-foreground leading-relaxed">{strategy}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
