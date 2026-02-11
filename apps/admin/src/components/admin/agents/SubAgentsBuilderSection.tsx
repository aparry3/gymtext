'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';

const CONDITION_CHECKS = ['equals', 'truthy', 'nonEmpty', 'allNonEmpty', 'length'] as const;
type ConditionCheck = typeof CONDITION_CHECKS[number];

interface SubAgentCondition {
  field: string;
  check: ConditionCheck;
  expected?: unknown;
  error?: string;
}

interface SubAgentMappingRow {
  key: string;
  source: string;
}

interface SubAgentRow {
  batch: number;
  key: string;
  agentId: string;
  inputMapping: SubAgentMappingRow[];
  condition: SubAgentCondition[];
}

interface SubAgentsBuilderSectionProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  agentIds: string[];
  error?: string | null;
}

interface ParseResult {
  rows: SubAgentRow[];
  invalidJson: boolean;
  unsupportedShape: boolean;
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

function parseSubAgentsJson(value: string): ParseResult {
  if (!value.trim() || value.trim() === 'null') {
    return { rows: [], invalidJson: false, unsupportedShape: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { rows: [], invalidJson: true, unsupportedShape: false };
  }

  if (!Array.isArray(parsed)) {
    return { rows: [], invalidJson: false, unsupportedShape: true };
  }

  let unsupportedShape = false;

  const rows: SubAgentRow[] = parsed
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => {
      const mappingRows: SubAgentMappingRow[] = [];
      const inputMapping = item.inputMapping;

      if (inputMapping && typeof inputMapping === 'object' && !Array.isArray(inputMapping)) {
        for (const [mapKey, mapValue] of Object.entries(inputMapping)) {
          if (typeof mapValue === 'string') {
            mappingRows.push({ key: mapKey, source: mapValue });
          } else {
            unsupportedShape = true;
          }
        }
      } else if (inputMapping !== undefined && inputMapping !== null) {
        unsupportedShape = true;
      }

      const conditionRows: SubAgentCondition[] = Array.isArray(item.condition)
        ? item.condition
          .filter((rule): rule is Record<string, unknown> => !!rule && typeof rule === 'object')
          .map((rule) => ({
            field: typeof rule.field === 'string' ? rule.field : '',
            check: CONDITION_CHECKS.includes(rule.check as ConditionCheck)
              ? (rule.check as ConditionCheck)
              : 'truthy',
            expected: rule.expected,
            error: typeof rule.error === 'string' ? rule.error : undefined,
          }))
        : [];

      return {
        batch: typeof item.batch === 'number' ? item.batch : 0,
        key: typeof item.key === 'string' ? item.key : '',
        agentId: typeof item.agentId === 'string' ? item.agentId : '',
        inputMapping: mappingRows,
        condition: conditionRows,
      };
    });

  return { rows, invalidJson: false, unsupportedShape };
}

function buildSubAgentsJson(rows: SubAgentRow[]): string {
  const payload = rows.map((row) => {
    const inputMapping = row.inputMapping.reduce<Record<string, string>>((acc, entry) => {
      if (!entry.key.trim() || !entry.source.trim()) return acc;
      acc[entry.key.trim()] = entry.source.trim();
      return acc;
    }, {});

    const condition = row.condition
      .filter((rule) => rule.field.trim().length > 0)
      .map((rule) => {
        const base: Record<string, unknown> = {
          field: rule.field.trim(),
          check: rule.check,
        };

        if (rule.check === 'equals' || rule.check === 'length') {
          const expected = parseLooseValue(toExpectedInput(rule.expected));
          if (expected !== undefined) base.expected = expected;
        }

        if (rule.error && rule.error.trim()) {
          base.error = rule.error.trim();
        }

        return base;
      });

    const payloadRow: Record<string, unknown> = {
      batch: Number.isFinite(row.batch) ? row.batch : 0,
      key: row.key.trim(),
      agentId: row.agentId.trim(),
    };

    if (Object.keys(inputMapping).length > 0) payloadRow.inputMapping = inputMapping;
    if (condition.length > 0) payloadRow.condition = condition;

    return payloadRow;
  });

  return JSON.stringify(payload, null, 2);
}

export function SubAgentsBuilderSection({
  value,
  onChange,
  onSave,
  agentIds,
  error,
}: SubAgentsBuilderSectionProps) {
  const parseResult = useMemo(() => parseSubAgentsJson(value), [value]);
  const [rows, setRows] = useState<SubAgentRow[]>(parseResult.rows);

  useEffect(() => {
    if (!parseResult.invalidJson) {
      setRows(parseResult.rows);
    }
  }, [parseResult.rows, parseResult.invalidJson]);

  const emit = (nextRows: SubAgentRow[]) => {
    setRows(nextRows);
    onChange(buildSubAgentsJson(nextRows));
  };

  const addSubAgent = () => {
    emit([
      ...rows,
      {
        batch: rows.length > 0 ? Math.max(...rows.map((row) => row.batch), 0) : 0,
        key: '',
        agentId: '',
        inputMapping: [],
        condition: [],
      },
    ]);
  };

  const removeSubAgent = (index: number) => {
    emit(rows.filter((_, i) => i !== index));
  };

  const updateSubAgent = (index: number, updates: Partial<SubAgentRow>) => {
    emit(rows.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  };

  const addMapping = (index: number) => {
    const row = rows[index];
    updateSubAgent(index, {
      inputMapping: [...row.inputMapping, { key: '', source: '$result' }],
    });
  };

  const updateMapping = (
    index: number,
    mapIndex: number,
    updates: Partial<SubAgentMappingRow>
  ) => {
    const row = rows[index];
    const nextMapping = row.inputMapping.map((entry, i) =>
      i === mapIndex ? { ...entry, ...updates } : entry
    );
    updateSubAgent(index, { inputMapping: nextMapping });
  };

  const removeMapping = (index: number, mapIndex: number) => {
    const row = rows[index];
    updateSubAgent(index, {
      inputMapping: row.inputMapping.filter((_, i) => i !== mapIndex),
    });
  };

  const addCondition = (index: number) => {
    const row = rows[index];
    updateSubAgent(index, {
      condition: [...row.condition, { field: '', check: 'truthy' }],
    });
  };

  const updateCondition = (
    index: number,
    conditionIndex: number,
    updates: Partial<SubAgentCondition>
  ) => {
    const row = rows[index];
    const nextCondition = row.condition.map((entry, i) =>
      i === conditionIndex ? { ...entry, ...updates } : entry
    );
    updateSubAgent(index, { condition: nextCondition });
  };

  const removeCondition = (index: number, conditionIndex: number) => {
    const row = rows[index];
    updateSubAgent(index, {
      condition: row.condition.filter((_, i) => i !== conditionIndex),
    });
  };

  const hasContent = value.trim().length > 0 && value.trim() !== 'null' && value.trim() !== '[]';

  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
        <span>Sub-Agents</span>
        <Badge variant="secondary" className="bg-slate-100 text-slate-700">{rows.length > 0 ? rows.length : hasContent ? 'Configured' : 0}</Badge>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pb-1 space-y-3">
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="bg-slate-200/60">
            <TabsTrigger value="builder" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">Builder</TabsTrigger>
            <TabsTrigger value="json" className="data-[state=active]:bg-white data-[state=active]:text-slate-900">JSON</TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-3">
            <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-700">Input Mapping Sources</p>
              <p>Use references like <code>$result</code>, <code>$result.overview</code>, <code>$user.name</code>, <code>$extras.absoluteWeek</code>, <code>$parentInput</code>, and <code>$now</code>.</p>
            </div>

            {parseResult.invalidJson && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                JSON is invalid. Fix it in the JSON tab to continue using Builder mode.
              </div>
            )}

            {!parseResult.invalidJson && parseResult.unsupportedShape && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                This config includes advanced nested input mapping that the builder cannot edit safely. Use the JSON tab for those entries.
              </div>
            )}

            {!parseResult.invalidJson && !parseResult.unsupportedShape && rows.map((row, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_8px_16px_-14px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-600">Sub-agent {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-600 hover:text-red-700"
                    onClick={() => removeSubAgent(index)}
                  >
                    Remove
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Result Key</Label>
                    <Input
                      className="border-slate-300 bg-slate-50/70"
                      value={row.key}
                      onChange={(e) => updateSubAgent(index, { key: e.target.value })}
                      placeholder="structure"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Batch</Label>
                    <Input
                      className="border-slate-300 bg-slate-50/70"
                      type="number"
                      min={0}
                      value={row.batch}
                      onChange={(e) => updateSubAgent(index, { batch: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-500">Agent ID</Label>
                    <Input
                      className="border-slate-300 bg-slate-50/70"
                      list="agent-ids"
                      value={row.agentId}
                      onChange={(e) => updateSubAgent(index, { agentId: e.target.value })}
                      placeholder="workout:structured"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-500">Input Mapping</Label>
                    <Button type="button" variant="outline" size="sm" className="h-7" onClick={() => addMapping(index)}>
                      Add Mapping
                    </Button>
                  </div>
                  {row.inputMapping.length === 0 && (
                    <p className="text-xs text-slate-400">No mapping configured. Parent result text will be used as input.</p>
                  )}
                  {row.inputMapping.map((mapRow, mapIndex) => (
                    <div key={mapIndex} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                      <Input
                        className="border-slate-300 bg-slate-50/70"
                        value={mapRow.key}
                        onChange={(e) => updateMapping(index, mapIndex, { key: e.target.value })}
                        placeholder="message"
                      />
                      <Input
                        className="border-slate-300 bg-slate-50/70"
                        value={mapRow.source}
                        onChange={(e) => updateMapping(index, mapIndex, { source: e.target.value })}
                        placeholder="$result.overview"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => removeMapping(index, mapIndex)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-gray-500">Run Conditions</Label>
                    <Button type="button" variant="outline" size="sm" className="h-7" onClick={() => addCondition(index)}>
                      Add Condition
                    </Button>
                  </div>
                  {row.condition.map((condition, conditionIndex) => (
                    <div key={conditionIndex} className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/70 p-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          className="border-slate-300 bg-white"
                          value={condition.field}
                          onChange={(e) => updateCondition(index, conditionIndex, { field: e.target.value })}
                          placeholder="validation.isValid"
                        />
                        <Select
                          value={condition.check}
                          onValueChange={(next) =>
                            updateCondition(index, conditionIndex, { check: next as ConditionCheck })
                          }
                        >
                          <SelectTrigger className="border-slate-300 bg-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CONDITION_CHECKS.map((check) => (
                              <SelectItem key={check} value={check}>{check}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {(condition.check === 'equals' || condition.check === 'length') && (
                        <Input
                          className="border-slate-300 bg-white"
                          value={toExpectedInput(condition.expected)}
                          onChange={(e) =>
                            updateCondition(index, conditionIndex, { expected: parseLooseValue(e.target.value) })
                          }
                          placeholder={condition.check === 'length' ? '7' : 'true'}
                        />
                      )}

                      <div className="grid grid-cols-[1fr_auto] gap-2">
                        <Input
                          className="border-slate-300 bg-white"
                          value={condition.error || ''}
                          onChange={(e) => updateCondition(index, conditionIndex, { error: e.target.value })}
                          placeholder="Optional error message"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => removeCondition(index, conditionIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {!parseResult.invalidJson && !parseResult.unsupportedShape && (
              <Button type="button" variant="outline" size="sm" onClick={addSubAgent} className="w-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50">
                Add Sub-Agent
              </Button>
            )}

            <datalist id="agent-ids">
              {agentIds.map((id) => (
                <option key={id} value={id} />
              ))}
            </datalist>
          </TabsContent>

          <TabsContent value="json" className="space-y-2">
            <div className="h-64 overflow-hidden rounded-xl border border-slate-300 bg-white">
              <CodeMirrorEditor
                value={value}
                onChange={onChange}
                language="json"
                placeholder='[{ "batch": 0, "key": "result", "agentId": "domain:agent", "inputMapping": { "message": "$result" } }]'
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
