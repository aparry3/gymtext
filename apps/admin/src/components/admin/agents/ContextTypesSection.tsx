'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ContextTypesSectionProps {
  contextTypes: string[];
  selected: string[];
  onChange: (types: string[]) => void;
}

const CONTEXT_DESCRIPTIONS: Record<string, string> = {
  user: 'Basic user account fields',
  userProfile: 'Current coaching profile markdown',
  fitnessPlan: 'Active fitness plan summary',
  dayOverview: 'Target day plan details',
  currentWorkout: 'Most recent workout data',
  dateContext: 'Today/date helpers for prompts',
  currentMicrocycle: 'Current weekly microcycle details',
  experienceLevel: 'Detected user experience level',
  dayFormat: 'Expected format for day responses',
  programVersion: 'Program version metadata',
  availableExercises: 'Exercise catalog available to the user',
};

export function ContextTypesSection({
  contextTypes,
  selected,
  onChange,
}: ContextTypesSectionProps) {
  const [query, setQuery] = useState('');

  const toggle = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  const filteredTypes = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return contextTypes;
    return contextTypes.filter((type) => {
      const description = CONTEXT_DESCRIPTIONS[type] || '';
      return (
        type.toLowerCase().includes(normalized) ||
        description.toLowerCase().includes(normalized)
      );
    });
  }, [contextTypes, query]);

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        <span>Context Types</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{selected.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1">
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search context..."
            className="h-8 border-slate-300 bg-white"
          />

          <div className="grid grid-cols-2 gap-2">
            {filteredTypes.map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2 transition-colors hover:bg-slate-100/70"
            >
              <input
                type="checkbox"
                checked={selected.includes(type)}
                onChange={() => toggle(type)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="min-w-0">
                <span className="block text-sm text-slate-700">{type}</span>
                {CONTEXT_DESCRIPTIONS[type] && (
                  <span className="block text-xs text-slate-500">
                    {CONTEXT_DESCRIPTIONS[type]}
                  </span>
                )}
              </span>
            </label>
            ))}
          </div>

          {filteredTypes.length === 0 && (
            <p className="text-xs italic text-slate-400">No matching context types</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
