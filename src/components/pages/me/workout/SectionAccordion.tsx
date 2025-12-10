'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionAccordionProps {
  title: string;
  exerciseCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function SectionAccordion({
  title,
  exerciseCount,
  isOpen,
  onToggle,
  children,
}: SectionAccordionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center gap-3 py-2 text-[hsl(var(--sidebar-foreground))]">
          {/* Chevron in rounded box */}
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg border transition-colors',
              isOpen
                ? 'bg-[hsl(var(--sidebar-accent))] border-[hsl(var(--sidebar-accent))]'
                : 'bg-transparent border-[hsl(var(--sidebar-border))]'
            )}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-white" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          {/* Title */}
          <span className="text-sm font-medium uppercase tracking-wide">
            {title}
          </span>

          {/* Count badge */}
          <span className="flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium rounded-full bg-[hsl(var(--sidebar-muted))] text-muted-foreground">
            {exerciseCount}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
