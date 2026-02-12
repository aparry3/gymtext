'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CodeMirrorEditor } from '@/components/ui/codemirror/CodeMirrorEditor';
import { MODEL_OPTIONS, type AdminAgentDefinition, type RegistryMetadata, type AgentExample } from './types';
import { ToolsSection } from './ToolsSection';
import { ContextTypesSection } from './ContextTypesSection';
import { ExamplesSection } from './ExamplesSection';
import { JsonConfigSection } from './JsonConfigSection';
import { SubAgentsBuilderSection } from './SubAgentsBuilderSection';
import { ValidationRulesBuilderSection } from './ValidationRulesBuilderSection';

interface AgentEditorPaneProps {
  agentId: string;
  onDirtyChange: (isDirty: boolean) => void;
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-100 flex items-center justify-center">
      <span className="text-gray-400">Loading editor...</span>
    </div>
  );
}

interface FormState {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  maxTokens: number;
  temperature: number;
  maxIterations: number;
  maxRetries: number;
  description: string;
  isActive: boolean;
  toolIds: string[];
  contextTypes: string[];
  subAgentsJson: string;
  schemaJsonJson: string;
  validationRulesJson: string;
  userPromptTemplate: string;
  examplesJson: string;
  evalPrompt: string;
  evalModel: string;
  defaultExtensionsJson: string;
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((v, i) => v === sortedB[i]);
}

function formStateEquals(a: FormState, b: FormState): boolean {
  return (
    a.systemPrompt === b.systemPrompt &&
    a.userPrompt === b.userPrompt &&
    a.model === b.model &&
    a.maxTokens === b.maxTokens &&
    a.temperature === b.temperature &&
    a.maxIterations === b.maxIterations &&
    a.maxRetries === b.maxRetries &&
    a.description === b.description &&
    a.isActive === b.isActive &&
    arraysEqual(a.toolIds, b.toolIds) &&
    arraysEqual(a.contextTypes, b.contextTypes) &&
    a.subAgentsJson === b.subAgentsJson &&
    a.schemaJsonJson === b.schemaJsonJson &&
    a.validationRulesJson === b.validationRulesJson &&
    a.userPromptTemplate === b.userPromptTemplate &&
    a.examplesJson === b.examplesJson &&
    a.evalPrompt === b.evalPrompt &&
    a.evalModel === b.evalModel &&
    a.defaultExtensionsJson === b.defaultExtensionsJson
  );
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}

function safeParse(str: string): { value: unknown; error: string | null } {
  if (!str.trim()) return { value: null, error: null };
  try {
    return { value: JSON.parse(str), error: null };
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid JSON' };
  }
}

const DEFAULT_FORM_STATE: FormState = {
  systemPrompt: '',
  userPrompt: '',
  model: 'gpt-5-nano',
  maxTokens: 16000,
  temperature: 1.0,
  maxIterations: 5,
  maxRetries: 1,
  description: '',
  isActive: true,
  toolIds: [],
  contextTypes: [],
  subAgentsJson: '',
  schemaJsonJson: '',
  validationRulesJson: '',
  userPromptTemplate: '',
  examplesJson: '[]',
  evalPrompt: '',
  evalModel: 'gpt-5-nano',
  defaultExtensionsJson: '',
};

const SCHEMA_TEMPLATES: Array<{ key: string; label: string; value: Record<string, unknown> }> = [
  {
    key: 'object',
    label: 'Object Response',
    value: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },
  },
  {
    key: 'messages',
    label: 'Messages Array',
    value: {
      type: 'object',
      required: ['messages'],
      properties: {
        messages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of SMS messages',
        },
      },
      additionalProperties: false,
    },
  },
  {
    key: 'validation',
    label: 'Validation Result',
    value: {
      type: 'object',
      required: ['isValid', 'errors'],
      properties: {
        isValid: { type: 'boolean' },
        errors: { type: 'array', items: { type: 'string' } },
      },
      additionalProperties: false,
    },
  },
];

export function AgentEditorPane({
  agentId,
  onDirtyChange,
  onHistoryToggle,
  isHistoryOpen,
}: AgentEditorPaneProps) {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [originalState, setOriginalState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({});
  const [registry, setRegistry] = useState<RegistryMetadata | null>(null);
  const registryFetched = useRef(false);

  // Fetch registry metadata (once)
  useEffect(() => {
    if (registryFetched.current) return;
    registryFetched.current = true;

    async function fetchRegistry() {
      try {
        const response = await fetch('/api/agent-registries');
        const result = await response.json();
        if (result.success && result.data) {
          setRegistry(result.data);
        }
      } catch (err) {
        console.error('Failed to fetch registry:', err);
      }
    }
    fetchRegistry();
  }, []);

  // Fetch agent definition
  useEffect(() => {
    async function fetchAgent() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/agent-definitions/${encodeURIComponent(agentId)}`);
        const result = await response.json();

        if (result.success && result.data) {
          const data: AdminAgentDefinition = result.data;
          const state: FormState = {
            systemPrompt: data.systemPrompt,
            userPrompt: data.userPrompt || '',
            model: data.model,
            maxTokens: data.maxTokens || 16000,
            temperature: data.temperature ? parseFloat(data.temperature) : 1.0,
            maxIterations: data.maxIterations || 5,
            maxRetries: data.maxRetries || 1,
            description: data.description || '',
            isActive: data.isActive,
            toolIds: data.toolIds || [],
            contextTypes: data.contextTypes || [],
            subAgentsJson: safeStringify(data.subAgents),
            schemaJsonJson: safeStringify(data.schemaJson),
            validationRulesJson: safeStringify(data.validationRules),
            userPromptTemplate: data.userPromptTemplate || '',
            examplesJson: JSON.stringify(data.examples || [], null, 2),
            evalPrompt: data.evalPrompt || '',
            evalModel: data.evalModel || 'gpt-5-nano',
            defaultExtensionsJson: safeStringify(data.defaultExtensions),
          };
          setFormState(state);
          setOriginalState(state);
          setLastSaved(new Date(data.createdAt));
          setJsonErrors({});
        } else {
          setError('Agent not found');
        }
      } catch (err) {
        setError('Failed to load agent');
        console.error('Failed to fetch agent:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAgent();
  }, [agentId]);

  // Track dirty state
  useEffect(() => {
    const isDirty = !formStateEquals(formState, originalState);
    onDirtyChange(isDirty);
  }, [formState, originalState, onDirtyChange]);

  // Validate JSON fields and return parsed body or null on error
  const validateAndBuildBody = useCallback((): Record<string, unknown> | null => {
    const errors: Record<string, string | null> = {};
    const jsonFields = [
      { key: 'subAgentsJson', label: 'Sub-Agents' },
      { key: 'schemaJsonJson', label: 'Output Schema' },
      { key: 'validationRulesJson', label: 'Validation Rules' },
      { key: 'defaultExtensionsJson', label: 'Default Extensions' },
    ] as const;

    const parsed: Record<string, unknown> = {};
    let hasError = false;

    for (const { key, label } of jsonFields) {
      const str = formState[key];
      if (!str.trim()) {
        parsed[key] = null;
        errors[key] = null;
      } else {
        const result = safeParse(str);
        if (result.error) {
          errors[key] = `${label}: ${result.error}`;
          hasError = true;
        } else {
          parsed[key] = result.value;
          errors[key] = null;
        }
      }
    }

    setJsonErrors(errors);
    if (hasError) return null;
    return parsed;
  }, [formState]);

  // Save handler
  const handleSave = useCallback(async () => {
    if (formStateEquals(formState, originalState)) return;

    const parsed = validateAndBuildBody();
    if (!parsed) {
      setError('Fix JSON errors before saving');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/agent-definitions/${encodeURIComponent(agentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: formState.systemPrompt,
          userPrompt: formState.userPrompt || null,
          model: formState.model,
          maxTokens: formState.maxTokens,
          temperature: formState.temperature.toString(),
          maxIterations: formState.maxIterations,
          maxRetries: formState.maxRetries,
          description: formState.description || null,
          isActive: formState.isActive,
          toolIds: formState.toolIds.length > 0 ? formState.toolIds : null,
          contextTypes: formState.contextTypes.length > 0 ? formState.contextTypes : null,
          subAgents: parsed.subAgentsJson,
          schemaJson: parsed.schemaJsonJson,
          validationRules: parsed.validationRulesJson,
          userPromptTemplate: formState.userPromptTemplate || null,
          examples: JSON.parse(formState.examplesJson),
          evalPrompt: formState.evalPrompt || null,
          evalModel: formState.evalModel || null,
          defaultExtensions: parsed.defaultExtensionsJson,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setOriginalState(formState);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [agentId, formState, originalState, validateAndBuildBody]);

  const isDirty = !formStateEquals(formState, originalState);

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const applySchemaTemplate = (templateKey: string) => {
    const template = SCHEMA_TEMPLATES.find((entry) => entry.key === templateKey);
    if (!template) return;
    updateField('schemaJsonJson', JSON.stringify(template.value, null, 2));
  };

  const appendPromptSnippet = (field: 'systemPrompt' | 'userPrompt', snippet: string) => {
    const current = formState[field].trim();
    const next = current ? `${formState[field]}\n\n${snippet}` : snippet;
    updateField(field, next);
  };

  // Examples structured form handler
  const parsedExamples: AgentExample[] = (() => {
    try {
      const parsed = JSON.parse(formState.examplesJson);
      return Array.isArray(parsed) ? parsed : [];
    }
    catch { return []; }
  })();

  const handleExamplesChange = useCallback(
    (examples: AgentExample[]) => {
      updateField('examplesJson', JSON.stringify(examples, null, 2));
    },
    []
  );

  return (
    <Card className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white/85 shadow-[0_20px_45px_-34px_rgba(15,23,42,0.6)] backdrop-blur">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/70 px-5 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-300 bg-white/80 text-slate-700">
            {agentId}
          </Badge>
          {isDirty && (
            <Badge variant="destructive" className="animate-pulse bg-rose-100 text-rose-700 border-rose-200">
              Unsaved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <span className="text-xs text-slate-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" className="border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-50" onClick={onHistoryToggle}>
            <HistoryIcon className="h-4 w-4 mr-1.5" />
            {isHistoryOpen ? 'Hide History' : 'History'}
          </Button>
          <Button size="sm" className="bg-sky-600 text-white hover:bg-sky-700" onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <EditorSkeleton />
        ) : (
          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/75 bg-slate-50/65 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800">Core Settings</h3>
                <span className="text-xs text-slate-500">Model behavior and runtime limits</span>
              </div>

              {/* Model Settings Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Model Select */}
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select
                    value={formState.model}
                    onValueChange={(v) => updateField('model', v)}
                  >
                    <SelectTrigger id="model" className="border-slate-300 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Max Tokens</Label>
                  <Input
                    id="maxTokens"
                    className="border-slate-300 bg-white"
                    type="number"
                    min={1}
                    max={128000}
                    value={formState.maxTokens}
                    onChange={(e) => updateField('maxTokens', parseInt(e.target.value) || 16000)}
                  />
                </div>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-slate-500">{formState.temperature.toFixed(2)}</span>
                </div>
                <Slider
                  min={0}
                  max={2}
                  step={0.05}
                  value={[formState.temperature]}
                  onValueChange={([v]) => updateField('temperature', v)}
                />
              </div>

              {/* Iterations and Retries Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxIterations">Max Iterations</Label>
                  <Input
                    id="maxIterations"
                    className="border-slate-300 bg-white"
                    type="number"
                    min={1}
                    max={50}
                    value={formState.maxIterations}
                    onChange={(e) => updateField('maxIterations', parseInt(e.target.value) || 5)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    className="border-slate-300 bg-white"
                    type="number"
                    min={0}
                    max={10}
                    value={formState.maxRetries}
                    onChange={(e) => updateField('maxRetries', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  className="border-slate-300 bg-white"
                  value={formState.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Brief description of what this agent does..."
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <div>
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-xs text-slate-500">Inactive agents are not used in production</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formState.isActive}
                  onCheckedChange={(v) => updateField('isActive', v)}
                />
              </div>
            </section>

            {/* Extended Configuration Sections */}
            <section className="space-y-3 rounded-2xl border border-slate-200/75 bg-slate-50/60 p-4">
              <h3 className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-700">Agent Configuration</h3>

              {/* Tools */}
              {registry && (
                <ToolsSection
                  tools={registry.tools}
                  selected={formState.toolIds}
                  onChange={(ids) => updateField('toolIds', ids)}
                />
              )}

              {/* Context Types */}
              {registry && (
                <ContextTypesSection
                  contextTypes={registry.contextTypes}
                  selected={formState.contextTypes}
                  onChange={(types) => updateField('contextTypes', types)}
                />
              )}

              {/* Examples */}
              <ExamplesSection
                examples={parsedExamples}
                onChange={handleExamplesChange}
              />

              {/* Sub-Agents (JSON) */}
              {registry && (
                <SubAgentsBuilderSection
                  value={formState.subAgentsJson}
                  onChange={(v) => updateField('subAgentsJson', v)}
                  onSave={handleSave}
                  agentIds={registry.agentIds}
                  error={jsonErrors.subAgentsJson}
                />
              )}

              {/* Output Schema (JSON) */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-xs text-slate-500">Schema Starters</Label>
                  {SCHEMA_TEMPLATES.map((template) => (
                    <Button
                      key={template.key}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      onClick={() => applySchemaTemplate(template.key)}
                    >
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>
              <JsonConfigSection
                label="Output Schema"
                value={formState.schemaJsonJson}
                onChange={(v) => updateField('schemaJsonJson', v)}
                onSave={handleSave}
                height="h-64"
                placeholder='{ "type": "object", "properties": { ... } }'
                error={jsonErrors.schemaJsonJson}
              />

              {/* Validation Rules */}
              <ValidationRulesBuilderSection
                value={formState.validationRulesJson}
                onChange={(v) => updateField('validationRulesJson', v)}
                onSave={handleSave}
                error={jsonErrors.validationRulesJson}
              />

              {/* Default Extensions */}
              <JsonConfigSection
                label="Default Extensions"
                value={formState.defaultExtensionsJson}
                onChange={(v) => updateField('defaultExtensionsJson', v)}
                onSave={handleSave}
                height="h-32"
                placeholder='{ "experienceLevel": "intermediate", "dayFormat": "TRAINING" }'
                error={jsonErrors.defaultExtensionsJson}
              />

              {/* User Prompt Template */}
              <div className="space-y-2">
                <Label>User Prompt Template</Label>
                <p className="text-xs text-slate-500">
                  Template with {'{{variable}}'} syntax for sub-agent input mapping
                </p>
                <div className="h-32 overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <CodeMirrorEditor
                    value={formState.userPromptTemplate}
                    onChange={(v) => updateField('userPromptTemplate', v)}
                    placeholder="Template with {{variable}} placeholders..."
                    onSave={handleSave}
                  />
                </div>
              </div>
            </section>

            {/* Eval Configuration */}
            <section className="space-y-3 rounded-2xl border border-slate-200/75 bg-slate-50/60 p-4">
              <h3 className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-700">Eval Configuration</h3>
              <p className="text-xs text-slate-500">
                Optional. Configure a rubric prompt to auto-evaluate this agent&apos;s output quality after each invocation.
              </p>

              {/* Eval Model */}
              <div className="space-y-2">
                <Label htmlFor="evalModel">Eval Model</Label>
                <Select
                  value={formState.evalModel}
                  onValueChange={(v) => updateField('evalModel', v)}
                >
                  <SelectTrigger id="evalModel" className="border-slate-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Eval Prompt */}
              <div className="space-y-2">
                <Label>Eval Prompt (Rubric)</Label>
                <p className="text-xs text-slate-500">
                  System prompt for the eval LLM. It receives the agent&apos;s input and response as JSON. Should output a score and reasoning.
                </p>
                <div className="h-48 overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <CodeMirrorEditor
                    value={formState.evalPrompt}
                    onChange={(v) => updateField('evalPrompt', v)}
                    placeholder="You are an evaluator. Score the agent's response from 0-10..."
                    onSave={handleSave}
                  />
                </div>
              </div>
            </section>

            {/* System Prompt */}
            <section className="space-y-2 rounded-2xl border border-slate-200/75 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <Label>System Prompt</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      appendPromptSnippet(
                        'systemPrompt',
                        '## Role\nYou are an expert assistant for this workflow.'
                      )
                    }
                  >
                    Add Role Block
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={() =>
                      appendPromptSnippet(
                        'systemPrompt',
                        '## Output Requirements\n- Follow the output schema exactly.\n- Do not include extra fields.\n- Keep responses concise and actionable.'
                      )
                    }
                  >
                    Add Output Rules
                  </Button>
                </div>
              </div>
              <div className="h-64 overflow-hidden rounded-xl border border-slate-300 bg-white">
                <CodeMirrorEditor
                  value={formState.systemPrompt}
                  onChange={(v) => updateField('systemPrompt', v)}
                  placeholder="Enter system prompt..."
                  onSave={handleSave}
                />
              </div>
            </section>

            {/* User Prompt */}
            <section className="space-y-2 rounded-2xl border border-slate-200/75 bg-slate-50/60 p-4">
              <div className="flex items-center justify-between">
                <Label>User Prompt (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  onClick={() =>
                    appendPromptSnippet(
                      'userPrompt',
                      'Generate the response using the provided context and return only the final answer.'
                    )
                  }
                >
                  Add Starter
                </Button>
              </div>
              <div className="h-48 overflow-hidden rounded-xl border border-slate-300 bg-white">
                <CodeMirrorEditor
                  value={formState.userPrompt}
                  onChange={(v) => updateField('userPrompt', v)}
                  placeholder="Enter user prompt template (optional)..."
                  onSave={handleSave}
                />
              </div>
            </section>
          </div>
        )}
      </div>
    </Card>
  );
}
