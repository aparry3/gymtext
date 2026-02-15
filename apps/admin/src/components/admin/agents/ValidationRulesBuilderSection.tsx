'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';

const RULE_CHECKS = ['equals', 'truthy', 'nonEmpty', 'allNonEmpty', 'length'] as const;
type RuleCheck = typeof RULE_CHECKS[number];

interface ValidationRuleRow {
  field: string;
  check: RuleCheck;
  expected?: unknown;
  error?: string;
}

interface ValidationRulesBuilderSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  error?: string | null;
}

function parseLooseValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;

  if (!Number.isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed);
  }

  if (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function toExpectedInput(value: unknown): string {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function parseValidationRulesJson(value: string): { rows: ValidationRuleRow[]; invalidJson: boolean } {
  if (!value.trim() || value.trim() === 'null') {
    return { rows: [], invalidJson: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { rows: [], invalidJson: true };
  }

  if (!Array.isArray(parsed)) {
    return { rows: [], invalidJson: true };
  }

  const rows: ValidationRuleRow[] = parsed
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      field: typeof item.field === 'string' ? item.field : '',
      check: RULE_CHECKS.includes(item.check as RuleCheck)
        ? (item.check as RuleCheck)
        : 'truthy',
      expected: item.expected,
      error: typeof item.error === 'string' ? item.error : undefined,
    }));

  return { rows, invalidJson: false };
}

function buildValidationRulesJson(rows: ValidationRuleRow[]): string {
  const payload = rows
    .filter((rule) => rule.field.trim())
    .map((rule) => {
      const next: Record<string, unknown> = {
        field: rule.field.trim(),
        check: rule.check,
      };

      if (rule.check === 'equals' || rule.check === 'length') {
        const expected = parseLooseValue(toExpectedInput(rule.expected));
        if (expected !== undefined) next.expected = expected;
      }

      if (rule.error && rule.error.trim()) {
        next.error = rule.error.trim();
      }

      return next;
    });

  return JSON.stringify(payload, null, 2);
}

export function ValidationRulesBuilderSection({
  value,
  onChange,
  onSave,
  error,
}: ValidationRulesBuilderSectionProps) {
  const parseResult = useMemo(() => parseValidationRulesJson(value), [value]);
  const [rows, setRows] = useState<ValidationRuleRow[]>(parseResult.rows);

  useEffect(() => {
    if (!parseResult.invalidJson) {
      setRows(parseResult.rows);
    }
  }, [parseResult.rows, parseResult.invalidJson]);

  const emit = (nextRows: ValidationRuleRow[]) => {
    setRows(nextRows);
    onChange(buildValidationRulesJson(nextRows));
  };

  const updateRule = (index: number, updates: Partial<ValidationRuleRow>) => {
    emit(rows.map((rule, i) => (i === index ? { ...rule, ...updates } : rule)));
  };

  const addRule = () => {
    emit([...rows, { field: '', check: 'truthy' }]);
  };

  const removeRule = (index: number) => {
    emit(rows.filter((_, i) => i !== index));
  };

  const hasContent = value.trim().length > 0 && value.trim() !== 'null' && value.trim() !== '[]';

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        <span>Validation Rules</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{rows.length > 0 ? rows.length : hasContent ? 'Configured' : 0}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1 space-y-3">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="bg-slate-200/60">
            <TabsTrigger value="builder" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Builder</TabsTrigger>
            <TabsTrigger value="json" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-3">
            {parseResult.invalidJson && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                JSON is invalid. Fix it in the JSON tab to continue using Builder mode.
              </div>
            )}

            {!parseResult.invalidJson && rows.map((rule, index) => (
              <div key={index} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    className="border-slate-300 bg-slate-50/70"
                    value={rule.field}
                    onChange={(e) => updateRule(index, { field: e.target.value })}
                    placeholder="validation.isValid"
                  />
                  <Select
                    value={rule.check}
                    onValueChange={(next) => updateRule(index, { check: next as RuleCheck })}
                  >
                    <SelectTrigger className="border-slate-300 bg-slate-50/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RULE_CHECKS.map((check) => (
                        <SelectItem key={check} value={check}>{check}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(rule.check === 'equals' || rule.check === 'length') && (
                  <Input
                    className="border-slate-300 bg-slate-50/70"
                    value={toExpectedInput(rule.expected)}
                    onChange={(e) => updateRule(index, { expected: parseLooseValue(e.target.value) })}
                    placeholder={rule.check === 'length' ? '7' : 'true'}
                  />
                )}

                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <Input
                    className="border-slate-300 bg-slate-50/70"
                    value={rule.error || ''}
                    onChange={(e) => updateRule(index, { error: e.target.value })}
                    placeholder="Optional error message"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => removeRule(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {!parseResult.invalidJson && (
              <Button type="button" variant="outline" size="sm" className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50" onClick={addRule}>
                Add Validation Rule
              </Button>
            )}
          </TabsContent>

          <TabsContent value="json" className="space-y-2">
            <div className="h-56 overflow-hidden rounded-xl border border-slate-300 bg-white">
              <CodeMirrorEditor
                value={value}
                onChange={onChange}
                language="json"
                placeholder='[{ "field": "validation.isValid", "check": "equals", "expected": true, "error": "Validation failed" }]'
                onSave={onSave}
              />
            </div>
          </TabsContent>
        </Tabs>

        {error && <p className="text-xs text-red-600">{error}</p>}
      </CollapsibleContent>
    </Collapsible>
  );
}
