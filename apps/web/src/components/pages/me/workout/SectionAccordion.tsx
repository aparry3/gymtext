'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Flame, Play, Zap, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionAccordionProps {
  title: string;
  exerciseCount: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  sectionType?: string;
  structure?: string;
  rounds?: number;
  sectionNotes?: string;
}

// Get icon for section type
function getSectionIcon(sectionType?: string, title?: string) {
  switch (sectionType) {
    case 'warmup':
      return <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />;
    case 'cooldown':
      return <Wind className="h-4 w-4 text-cyan-400 flex-shrink-0" />;
    case 'conditioning':
      return <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />;
    case 'main':
      return <Play className="h-4 w-4 text-blue-500 fill-blue-500 flex-shrink-0" />;
    default: {
      // Fallback: check title for warmup/cooldown
      const lower = (title || '').toLowerCase();
      if (lower.includes('warm')) {
        return <Flame className="h-4 w-4 text-orange-500 flex-shrink-0" />;
      }
      if (lower.includes('cool')) {
        return <Wind className="h-4 w-4 text-cyan-400 flex-shrink-0" />;
      }
      return <Play className="h-4 w-4 text-blue-500 fill-blue-500 flex-shrink-0" />;
    }
  }
}

// Format structure indicator for non-straight-sets
function getStructureLabel(structure?: string, rounds?: number): string | null {
  if (!structure || structure === 'straight-sets') return null;
  const label = structure.charAt(0).toUpperCase() + structure.slice(1);
  if (rounds && rounds > 1) {
    return `${label} \u00B7 ${rounds} rounds`;
  }
  return label;
}

export function SectionAccordion({
  title,
  exerciseCount,
  isOpen,
  onToggle,
  children,
  sectionType,
  structure,
  rounds,
  sectionNotes,
}: SectionAccordionProps) {
  const icon = getSectionIcon(sectionType, title);
  const structureLabel = getStructureLabel(structure, rounds);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <button className="sticky top-0 z-10 w-full flex items-center gap-3 py-3 px-4 bg-[hsl(var(--sidebar-bg))]/95 backdrop-blur border-y border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-foreground))]">
          {/* Section icon */}
          {icon}

          {/* Title */}
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {title}
          </span>

          {/* Structure badge */}
          {structureLabel && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {structureLabel}
            </span>
          )}

          {/* Count badge */}
          <span className="ml-auto flex items-center justify-center px-2 py-0.5 text-xs rounded-full bg-[hsl(var(--sidebar-muted))] text-slate-500">
            {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
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
        {sectionNotes && (
          <p className="px-4 py-2 text-xs text-slate-500 italic">
            {sectionNotes}
          </p>
        )}
        <div className="pt-2 space-y-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}
