'use client';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseAccordionCardProps {
  number: number;
  name: string;
  setsReps?: string;
  tags?: string[];
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function ExerciseAccordionCard({
  number,
  name,
  setsReps,
  tags = [],
  isOpen,
  onToggle,
  children,
}: ExerciseAccordionCardProps) {
  // Get first 2 tags for collapsed view
  const displayTags = tags.slice(0, 2);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div
        className={cn(
          'border rounded-xl transition-colors',
          isOpen ? 'border-[hsl(var(--sidebar-accent))]/30 bg-card' : 'border-border bg-card'
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors rounded-xl">
            <div className="flex items-center gap-3 min-w-0">
              {/* Exercise number */}
              <span className="text-sm text-muted-foreground font-mono">
                #{number.toString().padStart(2, '0')}
              </span>

              {/* Exercise name and details */}
              <div className="min-w-0">
                <h4 className="font-semibold text-foreground truncate">{name}</h4>

                {/* Collapsed view: sets x reps + tags */}
                {!isOpen && (
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {setsReps && (
                      <span className="text-sm font-medium text-[hsl(var(--sidebar-accent))]">
                        {setsReps}
                      </span>
                    )}
                    {displayTags.map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chevron */}
            <ChevronDown
              className={cn(
                'h-5 w-5 text-muted-foreground transition-transform flex-shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
