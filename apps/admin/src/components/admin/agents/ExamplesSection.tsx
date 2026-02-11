'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { AgentExample } from './types';

interface ExamplesSectionProps {
  examples: AgentExample[];
  onChange: (examples: AgentExample[]) => void;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

export function ExamplesSection({ examples, onChange }: ExamplesSectionProps) {
  const addExample = () => {
    onChange([...examples, { type: 'positive', input: '', output: '' }]);
  };

  const removeExample = (index: number) => {
    onChange(examples.filter((_, i) => i !== index));
  };

  const updateExample = (index: number, updates: Partial<AgentExample>) => {
    onChange(examples.map((ex, i) => (i === index ? { ...ex, ...updates } : ex)));
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        <span>Examples</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{examples.length}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pt-2 pb-1 space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_18px_-16px_rgba(15,23,42,0.5)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-slate-500">Type</Label>
                <Select
                  value={example.type}
                  onValueChange={(v: 'positive' | 'negative') =>
                    updateExample(index, { type: v })
                  }
                >
                  <SelectTrigger className="w-32 h-7 border-slate-300 bg-slate-50 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                onClick={() => removeExample(index)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Input</Label>
              <textarea
                className="min-h-[60px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50/60 px-3 py-2 font-mono text-sm"
                value={example.input}
                onChange={(e) => updateExample(index, { input: e.target.value })}
                placeholder="Example input to the agent..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-500">Output</Label>
              <textarea
                className="min-h-[60px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50/60 px-3 py-2 font-mono text-sm"
                value={example.output}
                onChange={(e) => updateExample(index, { output: e.target.value })}
                placeholder={
                  example.type === 'positive'
                    ? 'Expected output...'
                    : 'Bad output to avoid...'
                }
              />
            </div>

            {example.type === 'negative' && (
              <div className="space-y-1">
                <Label className="text-xs text-slate-500">Feedback</Label>
                <textarea
                  className="min-h-[40px] w-full resize-y rounded-lg border border-slate-300 bg-slate-50/60 px-3 py-2 font-mono text-sm"
                  value={example.feedback || ''}
                  onChange={(e) =>
                    updateExample(index, { feedback: e.target.value })
                  }
                  placeholder="Why is this output wrong?"
                />
              </div>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={addExample}
          className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          Add Example
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
