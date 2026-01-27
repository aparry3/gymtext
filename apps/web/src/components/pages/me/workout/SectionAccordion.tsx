'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Flame, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionAccordionProps {
  title: string;
  exerciseCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

// Determine if this is a warmup/cooldown section
const isWarmupOrCooldown = (title: string): boolean => {
  const lower = title.toLowerCase();
  return lower.includes('warm') || lower.includes('cool');
};

export function SectionAccordion({
  title,
  exerciseCount,
  isOpen,
  onToggle,
  children,
}: SectionAccordionProps) {
  const isWarmup = isWarmupOrCooldown(title);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="sticky top-0 z-10 w-full flex items-center gap-3 py-3 px-4 bg-[hsl(var(--sidebar-bg))]/95 backdrop-blur border-y border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))]">
          {/* Section icon */}
          {isWarmup ? (
            <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />
          ) : (
            <Play className="h-4 w-4 text-blue-500 fill-blue-500 flex-shrink-0" />
          )}

          {/* Title */}
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {title}
          </span>

          {/* Count badge */}
          <span className="ml-auto flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--sidebar-muted))] text-slate-500">
            {exerciseCount} Exercises
          </span>

          {/* Chevron */}
          <div
            className={cn(
              'flex items-center justify-center w-6 h-6 rounded transition-colors flex-shrink-0',
              isOpen
                ? 'text-white'
                : 'text-muted-foreground'
            )}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pt-2 space-y-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
