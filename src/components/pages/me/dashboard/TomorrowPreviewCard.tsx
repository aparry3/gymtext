'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Moon } from 'lucide-react';

interface TomorrowPreviewCardProps {
  title?: string;
  focus?: string;
  description?: string;
  isRestDay?: boolean;
  isLoading?: boolean;
}

export function TomorrowPreviewCard({
  title,
  focus,
  description,
  isRestDay = false,
  isLoading = false,
}: TomorrowPreviewCardProps) {
  if (isLoading) {
    return (
      <Card className="p-4 bg-card animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-muted rounded" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
        <div className="h-5 w-32 bg-muted rounded mb-2" />
        <div className="h-4 w-16 bg-muted rounded mb-2" />
        <div className="h-3 w-full bg-muted rounded" />
      </Card>
    );
  }

  if (isRestDay) {
    return (
      <Card className="p-4 bg-card">
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Moon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wide">Tomorrow</span>
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">Rest Day</h3>
        <p className="text-sm text-muted-foreground">
          Recovery and light activity scheduled.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card">
      <div className="flex items-center gap-2 text-muted-foreground mb-3">
        <Calendar className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Tomorrow</span>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-1">
        {title || 'Workout'}
      </h3>

      {focus && (
        <Badge
          variant="outline"
          className="text-[hsl(var(--sidebar-accent))] border-[hsl(var(--sidebar-accent))] mb-2"
        >
          {focus}
        </Badge>
      )}

      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
    </Card>
  );
}
