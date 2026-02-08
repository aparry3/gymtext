'use client';

import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';

interface JsonConfigSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  placeholder?: string;
  height?: string;
  error?: string | null;
}

export function JsonConfigSection({
  label,
  value,
  onChange,
  onSave,
  placeholder,
  height = 'h-48',
  error,
}: JsonConfigSectionProps) {
  const hasContent = value.trim().length > 0 && value.trim() !== 'null';

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
        <span>{label}</span>
        {hasContent && <Badge variant="secondary">Configured</Badge>}
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1">
        <div className={`${height} border rounded-lg overflow-hidden`}>
          <CodeMirrorEditor
            value={value}
            onChange={onChange}
            language="json"
            placeholder={placeholder}
            onSave={onSave}
          />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
