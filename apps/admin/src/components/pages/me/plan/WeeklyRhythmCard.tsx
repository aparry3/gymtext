'use client';

import { Card } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface DaySchedule {
  day: string;
  focus: string;
  activityType?: 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | string;
}

interface WeeklyRhythmCardProps {
  days?: DaySchedule[];
  isLoading?: boolean;
}

// Short day labels
const SHORT_DAYS: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

export function WeeklyRhythmCard({ days = [], isLoading = false }: WeeklyRhythmCardProps) {
  if (isLoading) {
    return (
      <Card className="p-5 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-5 w-28 bg-muted rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-4 w-10 bg-muted rounded" />
              <div className="h-4 flex-1 bg-muted rounded" />
              <div className="h-2.5 w-2.5 bg-muted rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (days.length === 0) {
    return null;
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <RefreshCw className="h-5 w-5 text-[hsl(var(--sidebar-accent))]" />
        <h3 className="font-semibold text-foreground">Weekly Rhythm</h3>
      </div>
      <div className="space-y-2">
        {days.map((day, index) => {
          const isRest = day.activityType === 'REST' || (day.focus?.toLowerCase().includes('rest') ?? false);
          const isTraining = !isRest;

          return (
            <div
              key={index}
              className="flex items-center gap-3 py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="w-10 text-sm font-medium text-muted-foreground">
                {SHORT_DAYS[day.day] || day.day}
              </span>
              <span
                className={`flex-1 text-sm ${
                  isRest ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {day.focus}
              </span>
              {isTraining && (
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--sidebar-accent))]" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
