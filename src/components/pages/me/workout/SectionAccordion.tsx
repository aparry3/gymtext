'use client';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
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
        <button
          className={cn(
            'w-full flex items-center justify-between p-3 rounded-lg transition-colors',
            'bg-[hsl(var(--sidebar-muted))] hover:bg-[hsl(var(--sidebar-muted))]/80',
            'text-[hsl(var(--sidebar-foreground))]'
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{title}</span>
            <Badge
              variant="secondary"
              className="text-xs bg-[hsl(var(--sidebar-accent))]/20 text-[hsl(var(--sidebar-accent))]"
            >
              {exerciseCount}
            </Badge>
          </div>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-muted-foreground transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-2 space-y-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
