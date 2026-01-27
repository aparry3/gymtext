'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, CheckCircle2, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExerciseAccordionCardProps {
  number: number;
  name: string;
  setsReps?: string;
  tags?: string[];
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  completedSets?: number;
  totalSets?: number;
  isFullyComplete?: boolean;
}

export function ExerciseAccordionCard({
  number,
  name,
  setsReps,
  tags = [],
  isOpen,
  onToggle,
  children,
  completedSets = 0,
  totalSets = 0,
  isFullyComplete = false,
}: ExerciseAccordionCardProps) {
  // Get first 2 tags for collapsed view
  const displayTags = tags.slice(0, 2);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div
        className={cn(
          'border-b border-slate-700/50 bg-slate-800/50 hover:bg-slate-800 transition-colors',
          isFullyComplete && 'opacity-70'
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center justify-between text-left cursor-pointer">
            <div className="flex items-center gap-4 min-w-0">
              {/* Progress indicator */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-colors flex-shrink-0',
                  isFullyComplete
                    ? 'bg-green-500 text-white'
                    : completedSets > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600 text-white'
                )}
              >
                {isFullyComplete ? (
                  <CheckCircle2 size={20} />
                ) : completedSets > 0 ? (
                  completedSets
                ) : (
                  totalSets || number
                )}
              </div>

              {/* Exercise name and details */}
              <div className="min-w-0">
                <h3
                  className={cn(
                    'font-semibold text-lg',
                    isFullyComplete
                      ? 'text-slate-400 line-through'
                      : 'text-slate-100',
                    !isOpen && 'truncate'
                  )}
                >
                  {name}
                </h3>

                {/* Collapsed view: metadata */}
                {!isOpen && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                    {displayTags.length > 0 && (
                      <>
                        <span className="uppercase tracking-wider font-medium text-blue-400">
                          {displayTags[0]}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {setsReps && (
                      <>
                        <span>{setsReps}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Timer size={12} />
                      60s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chevron */}
            <div className="text-slate-400 hover:text-white transition-colors flex-shrink-0">
              {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-6 animate-fadeIn">{children}</div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
