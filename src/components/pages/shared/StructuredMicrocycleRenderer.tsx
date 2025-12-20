'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { MicrocycleStructure } from '@/server/models/microcycle';

interface StructuredMicrocycleRendererProps {
  structure: MicrocycleStructure | null | undefined;
  showHeader?: boolean;
  className?: string;
}

// Activity type styling
const activityTypeStyles: Record<string, string> = {
  Lifting: 'bg-blue-100 text-blue-800 border-blue-200',
  Cardio: 'bg-green-100 text-green-800 border-green-200',
  Hybrid: 'bg-purple-100 text-purple-800 border-purple-200',
  Mobility: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rest: 'bg-gray-100 text-gray-600 border-gray-200',
  Sport: 'bg-orange-100 text-orange-800 border-orange-200',
};

/**
 * Renders a MicrocycleStructure with a clean day-by-day view.
 * Used in admin views and shared components to display weekly training patterns.
 */
export function StructuredMicrocycleRenderer({
  structure,
  showHeader = true,
  className = '',
}: StructuredMicrocycleRendererProps) {
  if (!structure) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No microcycle structure available.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showHeader && (
        <div className="mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              {structure.phase || `Week ${structure.weekNumber}`}
            </h2>
            {structure.isDeload && (
              <Badge variant="secondary">Deload</Badge>
            )}
          </div>
          {structure.overview && (
            <p className="text-sm text-muted-foreground mt-1">{structure.overview}</p>
          )}
        </div>
      )}

      {/* Day Cards Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {structure.days.map((day, index) => (
          <DayCard key={index} day={day} />
        ))}
      </div>
    </div>
  );
}

interface DayCardProps {
  day: MicrocycleStructure['days'][number];
}

function DayCard({ day }: DayCardProps) {
  const activityStyle = activityTypeStyles[day.activityType] || activityTypeStyles.Rest;

  return (
    <Card className={cn('p-4', day.isRest && 'opacity-75')}>
      <div className="space-y-2">
        {/* Day Name */}
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground">{day.day}</h4>
          <Badge variant="outline" className={cn('text-xs', activityStyle)}>
            {day.activityType}
          </Badge>
        </div>

        {/* Focus */}
        <p className={cn(
          'text-sm',
          day.isRest ? 'text-muted-foreground' : 'text-foreground'
        )}>
          {day.focus || (day.isRest ? 'Rest Day' : 'Training')}
        </p>

        {/* Notes */}
        {day.notes && (
          <p className="text-xs text-muted-foreground">{day.notes}</p>
        )}
      </div>
    </Card>
  );
}

/**
 * Compact version for inline display (e.g., in tables or lists)
 */
export function StructuredMicrocycleCompact({
  structure,
}: {
  structure: MicrocycleStructure | null | undefined;
}) {
  if (!structure) {
    return <span className="text-muted-foreground">No structure</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {structure.days.map((day, index) => {
        const isTraining = !day.isRest;
        return (
          <div
            key={index}
            className={cn(
              'w-8 h-8 rounded flex items-center justify-center text-xs font-medium',
              isTraining
                ? 'bg-[hsl(var(--sidebar-accent))] text-white'
                : 'bg-muted text-muted-foreground'
            )}
            title={`${day.day}: ${day.focus}`}
          >
            {day.day.slice(0, 1)}
          </div>
        );
      })}
    </div>
  );
}
