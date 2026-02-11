'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { RegistryToolMetadata } from './types';

interface ToolsSectionProps {
  tools: RegistryToolMetadata[];
  selected: string[];
  onChange: (toolIds: string[]) => void;
}

export function ToolsSection({ tools, selected, onChange }: ToolsSectionProps) {
  const [query, setQuery] = useState('');

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const filteredTools = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tools;
    return tools.filter((tool) => {
      return (
        tool.name.toLowerCase().includes(normalized) ||
        tool.description.toLowerCase().includes(normalized)
      );
    });
  }, [tools, query]);

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        <span>Tools</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{selected.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1">
        <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white/80 p-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools..."
            className="h-8 border-slate-300 bg-white"
          />

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((toolId) => (
                <button
                  key={toolId}
                  type="button"
                  onClick={() => toggle(toolId)}
                  className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  {toolId} x
                </button>
              ))}
            </div>
          )}

          {filteredTools.map((tool) => (
            <label
              key={tool.name}
              className="group flex cursor-pointer items-start gap-2 rounded-lg border border-transparent p-2 hover:border-slate-200 hover:bg-slate-50/80"
            >
              <input
                type="checkbox"
                checked={selected.includes(tool.name)}
                onChange={() => toggle(tool.name)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-900">
                  {tool.name}
                </span>
                {tool.description && (
                  <p className="truncate text-xs text-slate-500">
                    {tool.description.slice(0, 100)}
                    {tool.description.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
            </label>
          ))}
          {filteredTools.length === 0 && (
            <p className="text-xs italic text-slate-400">No tools registered</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
