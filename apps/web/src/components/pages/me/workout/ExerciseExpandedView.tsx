'use client';

import { Badge } from '@/components/ui/badge';
import { Layers, RefreshCw, Clock, Activity, Info } from 'lucide-react';

interface ExerciseExpandedViewProps {
  tags?: string[];
  sets?: string;
  reps?: string;
  rest?: string;
  intensity?: {
    type: string;
    value: string;
    description?: string;
  };
  notes?: string;
}

export function ExerciseExpandedView({
  tags = [],
  sets,
  reps,
  rest,
  intensity,
  notes,
}: ExerciseExpandedViewProps) {
  // Format intensity display
  const getIntensityDisplay = () => {
    if (!intensity || !intensity.value) return null;

    let display = intensity.value;
    if (intensity.type && intensity.type !== 'Other') {
      display = `${intensity.type} ${intensity.value}`;
    }
    if (intensity.description) {
      display += ` (${intensity.description})`;
    }
    return display;
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border/50">
      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="text-xs uppercase tracking-wide"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        {sets && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Layers className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Sets</span>
            </div>
            <p className="text-lg font-bold text-foreground">{sets}</p>
          </div>
        )}

        {reps && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Reps</span>
            </div>
            <p className="text-lg font-bold text-foreground">{reps}</p>
          </div>
        )}

        {rest && (
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs uppercase tracking-wide">Rest</span>
            </div>
            <p className="text-lg font-bold text-foreground">{rest}</p>
          </div>
        )}
      </div>

      {/* Intensity */}
      {intensity && intensity.value && (
        <div className="bg-[hsl(var(--sidebar-accent))]/5 border border-[hsl(var(--sidebar-accent))]/20 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-[hsl(var(--sidebar-accent))] mb-1">
            <Activity className="h-3.5 w-3.5" />
            <span className="text-xs uppercase tracking-wide font-medium">
              Intensity / Target
            </span>
          </div>
          <p className="font-medium text-foreground">{getIntensityDisplay()}</p>
        </div>
      )}

      {/* Notes */}
      {notes && (
        <div className="flex gap-2 text-muted-foreground">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm italic leading-relaxed">&ldquo;{notes}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
