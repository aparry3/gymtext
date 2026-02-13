'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Bot,
  MessageSquare,
  Sparkles,
  Database,
  Wrench,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { MODEL_OPTIONS, type AdminAgentExtension, type RegistryMetadata } from './types';
import { ToolsSection } from './ToolsSection';
import { ContextTypesSection } from './ContextTypesSection';
import { TemplateVersionHistory } from '../registry/TemplateVersionHistory';
import { AddExtensionDialog } from './AddExtensionDialog';

// ─── Types ──────────────────────────────────────────────────────────────

interface ExtensionFormState {
  description: string;
  triggerConditionsJson: string;
  systemPrompt: string;
  systemPromptMode: string;
  userPromptTemplate: string;
  userPromptTemplateMode: string;
  evalPrompt: string;
  evalPromptMode: string;
  model: string;
  maxTokens: string;
  maxIterations: string;
  maxRetries: string;
  toolIds: string[];
  contextTypes: string[];
  schemaJsonJson: string;
  validationRulesJson: string;
  subAgentsJson: string;
  examplesJson: string;
}

type ExtensionTree = Record<string, string[]>;

// ─── Helpers ────────────────────────────────────────────────────────────

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

function buildTree(extensions: AdminAgentExtension[]): ExtensionTree {
  const tree: ExtensionTree = {};
  for (const ext of extensions) {
    if (!tree[ext.extensionType]) tree[ext.extensionType] = [];
    if (!tree[ext.extensionType].includes(ext.extensionKey)) {
      tree[ext.extensionType].push(ext.extensionKey);
    }
  }
  return tree;
}

function extensionToForm(ext: AdminAgentExtension): ExtensionFormState {
  return {
    description: ext.description || '',
    triggerConditionsJson: safeStringify(ext.triggerConditions),
    systemPrompt: ext.systemPrompt || '',
    systemPromptMode: ext.systemPromptMode || 'override',
    userPromptTemplate: ext.userPromptTemplate || '',
    userPromptTemplateMode: ext.userPromptTemplateMode || 'override',
    evalPrompt: ext.evalPrompt || '',
    evalPromptMode: ext.evalPromptMode || 'override',
    model: ext.model || '',
    maxTokens: ext.maxTokens != null ? String(ext.maxTokens) : '',
    maxIterations: ext.maxIterations != null ? String(ext.maxIterations) : '',
    maxRetries: ext.maxRetries != null ? String(ext.maxRetries) : '',
    toolIds: ext.toolIds || [],
    contextTypes: ext.contextTypes || [],
    schemaJsonJson: safeStringify(ext.schemaJson),
    validationRulesJson: safeStringify(ext.validationRules),
    subAgentsJson: safeStringify(ext.subAgents),
    examplesJson: safeStringify(ext.examples),
  };
}

const DEFAULT_FORM: ExtensionFormState = {
  description: '',
  triggerConditionsJson: '',
  systemPrompt: '',
  systemPromptMode: 'override',
  userPromptTemplate: '',
  userPromptTemplateMode: 'override',
  evalPrompt: '',
  evalPromptMode: 'override',
  model: '',
  maxTokens: '',
  maxIterations: '',
  maxRetries: '',
  toolIds: [],
  contextTypes: [],
  schemaJsonJson: '',
  validationRulesJson: '',
  subAgentsJson: '',
  examplesJson: '',
};

function formEquals(a: ExtensionFormState, b: ExtensionFormState): boolean {
  return (
    a.description === b.description &&
    a.triggerConditionsJson === b.triggerConditionsJson &&
    a.systemPrompt === b.systemPrompt &&
    a.systemPromptMode === b.systemPromptMode &&
    a.userPromptTemplate === b.userPromptTemplate &&
    a.userPromptTemplateMode === b.userPromptTemplateMode &&
    a.evalPrompt === b.evalPrompt &&
    a.evalPromptMode === b.evalPromptMode &&
    a.model === b.model &&
    a.maxTokens === b.maxTokens &&
    a.maxIterations === b.maxIterations &&
    a.maxRetries === b.maxRetries &&
    JSON.stringify([...a.toolIds].sort()) === JSON.stringify([...b.toolIds].sort()) &&
    JSON.stringify([...a.contextTypes].sort()) === JSON.stringify([...b.contextTypes].sort()) &&
    a.schemaJsonJson === b.schemaJsonJson &&
    a.validationRulesJson === b.validationRulesJson &&
    a.subAgentsJson === b.subAgentsJson &&
    a.examplesJson === b.examplesJson
  );
}

// ─── Editable Text Component ────────────────────────────────────────────

function EditablePromptText({
  value,
  onChange,
  placeholder,
  minHeightClass = 'min-h-[120px]',
  mono = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minHeightClass?: string;
  mono?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!ref.current || isFocusedRef.current) return;
    if (ref.current.innerText !== value) {
      ref.current.innerText = value;
    }
  }, [value]);

  return (
    <div className="relative rounded-xl border border-white/90 bg-white/90 shadow-inner">
      {!value.trim() && (
        <p className="pointer-events-none absolute left-3 top-3 text-sm text-slate-400">{placeholder}</p>
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline
        className={cn(
          'w-full whitespace-pre-wrap break-words p-3 text-sm leading-6 text-slate-800 outline-none',
          minHeightClass,
          mono && 'font-mono text-xs leading-5'
        )}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onBlur={(e) => {
          isFocusedRef.current = false;
          onChange((e.currentTarget.innerText || '').replace(/\u00a0/g, ' '));
        }}
        onInput={(e) => {
          onChange((e.currentTarget.textContent || '').replace(/\u00a0/g, ' '));
        }}
      />
    </div>
  );
}

// ─── Collapsible Section ────────────────────────────────────────────────

function ExtSection({
  icon,
  title,
  subtitle,
  children,
  tone,
  defaultOpen = true,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  tone: 'system' | 'user' | 'example' | 'context' | 'runtime';
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toneClasses =
    tone === 'system'
      ? 'border-sky-200/90 bg-sky-50/70'
      : tone === 'user'
        ? 'border-violet-200/90 bg-violet-50/70'
        : tone === 'example'
          ? 'border-emerald-200/90 bg-emerald-50/70'
          : tone === 'runtime'
            ? 'border-amber-200/90 bg-amber-50/70'
            : 'border-indigo-200/90 bg-indigo-50/70';

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <section className={cn('rounded-2xl border p-4', toneClasses)}>
        <CollapsibleTrigger className="w-full text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-lg border border-white/70 bg-white/85 p-1.5 text-slate-700">{icon}</span>
              <div>
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <p className="text-xs text-slate-600">{subtitle}</p>
              </div>
            </div>
            <span className="rounded-md border border-white/70 bg-white/85 p-1 text-slate-600">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3">{children}</CollapsibleContent>
      </section>
    </Collapsible>
  );
}

// ─── Sidebar Chevron ────────────────────────────────────────────────────

function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      className={`${className} transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

interface AgentExtensionsPaneProps {
  agentId: string;
}

export function AgentExtensionsPane({ agentId }: AgentExtensionsPaneProps) {
  // Extension list state
  const [extensions, setExtensions] = useState<AdminAgentExtension[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Selection
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Form state
  const [formState, setFormState] = useState<ExtensionFormState>(DEFAULT_FORM);
  const [originalState, setOriginalState] = useState<ExtensionFormState>(DEFAULT_FORM);
  const [isLoadingEditor, setIsLoadingEditor] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({});

  // Registry metadata for tools/context
  const [registry, setRegistry] = useState<RegistryMetadata | null>(null);
  const registryFetched = useRef(false);

  // History panel
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Add dialog
  const [isAddOpen, setIsAddOpen] = useState(false);

  const isDirty = !formEquals(formState, originalState);

  // Fetch registry metadata
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

  // Fetch extension list for this agent
  const fetchExtensions = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch(
        `/api/agent-definitions/${encodeURIComponent(agentId)}/extensions`
      );
      const result = await response.json();
      if (result.success) {
        setExtensions(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch extensions:', err);
    } finally {
      setIsLoadingList(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchExtensions();
  }, [fetchExtensions]);

  // Fetch single extension details when selection changes
  useEffect(() => {
    if (!selectedType || !selectedKey) return;

    async function fetchExtension() {
      setIsLoadingEditor(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/agent-definitions/${encodeURIComponent(agentId)}/extensions/${encodeURIComponent(selectedType!)}/${encodeURIComponent(selectedKey!)}`
        );
        const result = await response.json();
        if (result.success && result.data) {
          const form = extensionToForm(result.data as AdminAgentExtension);
          setFormState(form);
          setOriginalState(form);
          setLastSaved(new Date(result.data.createdAt));
          setJsonErrors({});
        }
      } catch (err) {
        setError('Failed to load extension');
        console.error('Failed to fetch extension:', err);
      } finally {
        setIsLoadingEditor(false);
      }
    }
    fetchExtension();
  }, [agentId, selectedType, selectedKey]);

  // Sidebar handlers
  const handleSelect = useCallback(
    (type: string, key: string) => {
      if (isDirty && !confirm('Discard unsaved changes?')) return;
      setSelectedType(type);
      setSelectedKey(key);
      setIsHistoryOpen(false);
    },
    [isDirty]
  );

  const toggleType = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // Update form field
  const updateField = <K extends keyof ExtensionFormState>(field: K, value: ExtensionFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // Save handler
  const handleSave = useCallback(async () => {
    if (!selectedType || !selectedKey || !isDirty) return;

    // Validate JSON fields
    const errors: Record<string, string | null> = {};
    const jsonFields = [
      { key: 'triggerConditionsJson', label: 'Trigger Conditions' },
      { key: 'schemaJsonJson', label: 'Schema JSON' },
      { key: 'validationRulesJson', label: 'Validation Rules' },
      { key: 'subAgentsJson', label: 'Sub-Agents' },
      { key: 'examplesJson', label: 'Examples' },
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
    if (hasError) {
      setError('Fix configuration errors before saving');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        systemPrompt: formState.systemPrompt || null,
        systemPromptMode: formState.systemPromptMode || null,
        userPromptTemplate: formState.userPromptTemplate || null,
        userPromptTemplateMode: formState.userPromptTemplateMode || null,
        evalPrompt: formState.evalPrompt || null,
        evalPromptMode: formState.evalPromptMode || null,
        model: formState.model || null,
        maxTokens: formState.maxTokens ? parseInt(formState.maxTokens, 10) : null,
        maxIterations: formState.maxIterations ? parseInt(formState.maxIterations, 10) : null,
        maxRetries: formState.maxRetries ? parseInt(formState.maxRetries, 10) : null,
        toolIds: formState.toolIds.length > 0 ? formState.toolIds : null,
        contextTypes: formState.contextTypes.length > 0 ? formState.contextTypes : null,
        schemaJson: parsed.schemaJsonJson,
        validationRules: parsed.validationRulesJson,
        subAgents: parsed.subAgentsJson,
        examples: parsed.examplesJson,
        triggerConditions: parsed.triggerConditionsJson,
        description: formState.description || null,
      };

      const response = await fetch(
        `/api/agent-definitions/${encodeURIComponent(agentId)}/extensions/${encodeURIComponent(selectedType)}/${encodeURIComponent(selectedKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      if (!result.success) throw new Error(result.message);

      setOriginalState(formState);
      setLastSaved(new Date());
      fetchExtensions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }, [agentId, selectedType, selectedKey, formState, isDirty, fetchExtensions]);

  // Build tree from extensions
  const tree = buildTree(extensions);
  const selectedId = selectedType && selectedKey ? `${selectedType}/${selectedKey}` : null;

  return (
    <div className="flex h-full gap-4">
      {/* Left Sidebar - Extension Tree */}
      <aside className="w-56 flex-shrink-0 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/85 shadow-inner backdrop-blur">
        <div className="border-b border-slate-200/80 bg-slate-50/70 p-3">
          <Button
            size="sm"
            className="w-full bg-sky-600 text-white hover:bg-sky-700"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Extension
          </Button>
        </div>

        {isLoadingList ? (
          <div className="p-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
                <div className="ml-3 space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : Object.keys(tree).length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No extensions defined</p>
        ) : (
          <div className="p-2">
            {Object.entries(tree)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([type, keys]) => (
                <div key={type} className="mb-1">
                  <button
                    className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
                    onClick={() => toggleType(type)}
                  >
                    <ChevronIcon expanded={expandedTypes.has(type)} className="h-3 w-3 text-slate-400" />
                    <span className="truncate">{type}</span>
                    <Badge variant="secondary" className="ml-auto bg-slate-100 text-slate-600 text-[10px]">
                      {keys.length}
                    </Badge>
                  </button>
                  {expandedTypes.has(type) && (
                    <div className="ml-4">
                      {keys.sort().map((key) => {
                        const itemId = `${type}/${key}`;
                        return (
                          <button
                            key={itemId}
                            className={cn(
                              'w-full text-left px-2 py-1 rounded-md text-xs transition-colors',
                              selectedId === itemId
                                ? 'bg-sky-50 text-sky-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-50'
                            )}
                            onClick={() => handleSelect(type, key)}
                          >
                            {key}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </aside>

      {/* Main Editor */}
      <main className="flex-1 flex flex-col min-w-0">
        {selectedType && selectedKey ? (
          <Card className="flex flex-1 flex-col rounded-2xl border border-slate-200/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.95),rgba(248,250,252,0.95))] shadow-[0_20px_45px_-34px_rgba(15,23,42,0.6)] backdrop-blur">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 py-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="border-slate-300 bg-white/90 text-slate-700">
                  {selectedType}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                  {selectedKey}
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-white/85 text-slate-700 hover:bg-slate-50"
                  onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                >
                  {isHistoryOpen ? 'Hide History' : 'History'}
                </Button>
                <Button
                  size="sm"
                  className="bg-sky-600 text-white hover:bg-sky-700"
                  onClick={handleSave}
                  disabled={!isDirty || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {error && (
              <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>
            )}

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingEditor ? (
                <div className="h-full w-full animate-pulse bg-slate-100/70 flex items-center justify-center rounded-xl">
                  <span className="text-slate-500">Loading extension...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="ext-description">Description</Label>
                    <Input
                      id="ext-description"
                      value={formState.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="What this extension does"
                      className="border-slate-300 bg-white"
                    />
                  </div>

                  {/* Trigger Conditions */}
                  <div className="space-y-2">
                    <Label>Trigger Conditions</Label>
                    <p className="text-xs text-slate-500">
                      Array of rules: [{'{ field, check, expected, error }'}]
                    </p>
                    <EditablePromptText
                      value={formState.triggerConditionsJson}
                      onChange={(value) => updateField('triggerConditionsJson', value)}
                      placeholder='[{ "field": "experienceLevel", "check": "equals", "expected": "beginner", "error": "Not a beginner" }]'
                      minHeightClass="min-h-[80px]"
                      mono
                    />
                    {jsonErrors.triggerConditionsJson && (
                      <p className="text-xs text-rose-600">{jsonErrors.triggerConditionsJson}</p>
                    )}
                  </div>

                  {/* Prompts Section */}
                  <ExtSection
                    icon={<Bot className="h-4 w-4" />}
                    title="Prompts"
                    subtitle="System prompt, user prompt template, and eval prompt overrides"
                    tone="system"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>System Prompt</Label>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span>Override</span>
                            <Switch
                              checked={formState.systemPromptMode === 'append'}
                              onCheckedChange={(checked) =>
                                updateField('systemPromptMode', checked ? 'append' : 'override')
                              }
                            />
                            <span>Append</span>
                          </div>
                        </div>
                        <EditablePromptText
                          value={formState.systemPrompt}
                          onChange={(value) => updateField('systemPrompt', value)}
                          placeholder="System prompt override or addition..."
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>User Prompt Template</Label>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span>Override</span>
                            <Switch
                              checked={formState.userPromptTemplateMode === 'append'}
                              onCheckedChange={(checked) =>
                                updateField('userPromptTemplateMode', checked ? 'append' : 'override')
                              }
                            />
                            <span>Append</span>
                          </div>
                        </div>
                        <EditablePromptText
                          value={formState.userPromptTemplate}
                          onChange={(value) => updateField('userPromptTemplate', value)}
                          placeholder="User prompt template override..."
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Eval Prompt</Label>
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <span>Override</span>
                            <Switch
                              checked={formState.evalPromptMode === 'append'}
                              onCheckedChange={(checked) =>
                                updateField('evalPromptMode', checked ? 'append' : 'override')
                              }
                            />
                            <span>Append</span>
                          </div>
                        </div>
                        <EditablePromptText
                          value={formState.evalPrompt}
                          onChange={(value) => updateField('evalPrompt', value)}
                          placeholder="Eval prompt override..."
                          minHeightClass="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </ExtSection>

                  {/* Runtime Overrides */}
                  <ExtSection
                    icon={<Settings2 className="h-4 w-4" />}
                    title="Runtime Overrides"
                    subtitle="Model and parameter overrides for this extension"
                    tone="runtime"
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Select value={formState.model} onValueChange={(value) => updateField('model', value)}>
                          <SelectTrigger className="border-slate-300 bg-white">
                            <SelectValue placeholder="Agent default" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Agent default</SelectItem>
                            {MODEL_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="ext-maxTokens">Max Tokens</Label>
                          <Input
                            id="ext-maxTokens"
                            type="number"
                            value={formState.maxTokens}
                            onChange={(e) => updateField('maxTokens', e.target.value)}
                            placeholder="Agent default"
                            className="border-slate-300 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="ext-maxIterations">Max Iterations</Label>
                          <Input
                            id="ext-maxIterations"
                            type="number"
                            value={formState.maxIterations}
                            onChange={(e) => updateField('maxIterations', e.target.value)}
                            placeholder="Agent default"
                            className="border-slate-300 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="ext-maxRetries">Max Retries</Label>
                          <Input
                            id="ext-maxRetries"
                            type="number"
                            value={formState.maxRetries}
                            onChange={(e) => updateField('maxRetries', e.target.value)}
                            placeholder="Agent default"
                            className="border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </ExtSection>

                  {/* Tools & Context */}
                  {registry && (
                    <ExtSection
                      icon={<Wrench className="h-4 w-4" />}
                      title="Tools & Context"
                      subtitle="Override agent tool and context selections"
                      tone="context"
                      defaultOpen={false}
                    >
                      <div className="space-y-3">
                        <ToolsSection
                          tools={registry.tools}
                          selected={formState.toolIds}
                          onChange={(toolIds) => updateField('toolIds', toolIds)}
                        />
                        <ContextTypesSection
                          contextTypes={registry.contextTypes}
                          selected={formState.contextTypes}
                          onChange={(contextTypes) => updateField('contextTypes', contextTypes)}
                        />
                      </div>
                    </ExtSection>
                  )}

                  {/* Advanced */}
                  <ExtSection
                    icon={<Database className="h-4 w-4" />}
                    title="Advanced"
                    subtitle="Schema JSON, validation rules, sub-agents, and examples"
                    tone="example"
                    defaultOpen={false}
                  >
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label>Schema JSON</Label>
                        <EditablePromptText
                          value={formState.schemaJsonJson}
                          onChange={(value) => updateField('schemaJsonJson', value)}
                          placeholder='{ "type": "object", "properties": {} }'
                          minHeightClass="min-h-[80px]"
                          mono
                        />
                        {jsonErrors.schemaJsonJson && (
                          <p className="text-xs text-rose-600">{jsonErrors.schemaJsonJson}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label>Validation Rules</Label>
                        <EditablePromptText
                          value={formState.validationRulesJson}
                          onChange={(value) => updateField('validationRulesJson', value)}
                          placeholder='[{ "type": "required" }]'
                          minHeightClass="min-h-[80px]"
                          mono
                        />
                        {jsonErrors.validationRulesJson && (
                          <p className="text-xs text-rose-600">{jsonErrors.validationRulesJson}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label>Sub-Agents</Label>
                        <EditablePromptText
                          value={formState.subAgentsJson}
                          onChange={(value) => updateField('subAgentsJson', value)}
                          placeholder='[{ "agentId": "domain:agent" }]'
                          minHeightClass="min-h-[80px]"
                          mono
                        />
                        {jsonErrors.subAgentsJson && (
                          <p className="text-xs text-rose-600">{jsonErrors.subAgentsJson}</p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <Label>Examples</Label>
                        <EditablePromptText
                          value={formState.examplesJson}
                          onChange={(value) => updateField('examplesJson', value)}
                          placeholder='[{ "type": "positive", "input": "...", "output": "..." }]'
                          minHeightClass="min-h-[80px]"
                          mono
                        />
                        {jsonErrors.examplesJson && (
                          <p className="text-xs text-rose-600">{jsonErrors.examplesJson}</p>
                        )}
                      </div>
                    </div>
                  </ExtSection>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300/80 bg-white/55 backdrop-blur">
            <div className="text-center">
              <Sparkles className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">No extension selected</h3>
              <p className="mt-1 text-sm text-slate-500">
                Select an extension from the sidebar or create a new one.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Version History */}
      {isHistoryOpen && selectedType && selectedKey && (
        <aside className="w-80 flex-shrink-0">
          <TemplateVersionHistory
            key={`history-${agentId}-${selectedType}-${selectedKey}`}
            fetchUrl={`/api/agent-definitions/${encodeURIComponent(agentId)}/extensions/${encodeURIComponent(selectedType)}/${encodeURIComponent(selectedKey)}/history?limit=20`}
            contentKey="systemPrompt"
            onRevert={(version) => {
              // Revert by saving the old version's content as a new version
              const apiPath = `/api/agent-definitions/${encodeURIComponent(agentId)}/extensions/${encodeURIComponent(selectedType)}/${encodeURIComponent(selectedKey)}`;
              fetch(apiPath, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ systemPrompt: version.content }),
              })
                .then((res) => res.json())
                .then((result) => {
                  if (result.success) {
                    // Refresh the editor
                    setSelectedType(selectedType);
                    setSelectedKey(selectedKey);
                    fetchExtensions();
                  }
                })
                .catch((err) => {
                  console.error('Failed to revert:', err);
                });
            }}
            onClose={() => setIsHistoryOpen(false)}
          />
        </aside>
      )}

      {/* Add Extension Dialog */}
      <AddExtensionDialog
        agentId={agentId}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onCreated={() => {
          fetchExtensions();
        }}
      />
    </div>
  );
}
