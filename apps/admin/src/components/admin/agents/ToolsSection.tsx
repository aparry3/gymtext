'use client';

import { Badge } from '@/components/ui/badge';
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
  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
        <span>Tools</span>
        <Badge variant="secondary">{selected.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1">
        <div className="space-y-2">
          {tools.map((tool) => (
            <label
              key={tool.name}
              className="flex items-start gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selected.includes(tool.name)}
                onChange={() => toggle(tool.name)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">
                  {tool.name}
                </span>
                {tool.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {tool.description.slice(0, 100)}
                    {tool.description.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>
            </label>
          ))}
          {tools.length === 0 && (
            <p className="text-xs text-gray-400 italic">No tools registered</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
