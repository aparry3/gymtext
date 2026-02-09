'use client';

import { Badge } from '@/components/ui/badge';
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

export function ContextTypesSection({
  contextTypes,
  selected,
  onChange,
}: ContextTypesSectionProps) {
  const toggle = (type: string) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type));
    } else {
      onChange([...selected, type]);
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
        <span>Context Types</span>
        <Badge variant="secondary">{selected.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1">
        <div className="grid grid-cols-2 gap-2">
          {contextTypes.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(type)}
                onChange={() => toggle(type)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
