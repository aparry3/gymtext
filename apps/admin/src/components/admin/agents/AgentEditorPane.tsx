'use client'

import { useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react'
import {
  Bot,
  ChevronDown,
  ChevronUp,
  Clock3,
  Database,
  MessageSquare,
  Plus,
  Sparkles,
  Trash2,
  Wrench,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { MODEL_OPTIONS, type AdminAgentDefinition, type RegistryMetadata, type AgentExample } from './types'
import { ToolsSection } from './ToolsSection'
import { ContextTypesSection } from './ContextTypesSection'

interface AgentEditorPaneProps {
  agentId: string
  onDirtyChange: (isDirty: boolean) => void
  onHistoryToggle: () => void
  isHistoryOpen: boolean
}

interface FormState {
  systemPrompt: string
  userPrompt: string
  model: string
  maxTokens: number
  maxIterations: number
  maxRetries: number
  description: string
  isActive: boolean
  toolIds: string[]
  contextTypes: string[]
  subAgentsJson: string
  schemaJsonJson: string
  validationRulesJson: string
  userPromptTemplate: string
  examplesJson: string
  evalPrompt: string
  evalModel: string
  defaultExtensionsJson: string
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sortedA = [...a].sort()
  const sortedB = [...b].sort()
  return sortedA.every((v, i) => v === sortedB[i])
}

function formStateEquals(a: FormState, b: FormState): boolean {
  return (
    a.systemPrompt === b.systemPrompt &&
    a.userPrompt === b.userPrompt &&
    a.model === b.model &&
    a.maxTokens === b.maxTokens &&
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
  )
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return ''
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return ''
  }
}

function safeParse(str: string): { value: unknown; error: string | null } {
  if (!str.trim()) return { value: null, error: null }
  try {
    return { value: JSON.parse(str), error: null }
  } catch (e) {
    return { value: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
  }
}

function parseExamples(value: string): AgentExample[] {
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []

    return parsed.map((item) => ({
      type: item?.type === 'negative' ? 'negative' : 'positive',
      input: typeof item?.input === 'string' ? item.input : '',
      output: typeof item?.output === 'string' ? item.output : '',
      feedback: typeof item?.feedback === 'string' ? item.feedback : '',
    }))
  } catch {
    return []
  }
}

const DEFAULT_FORM_STATE: FormState = {
  systemPrompt: '',
  userPrompt: '',
  model: 'gpt-5-nano',
  maxTokens: 16000,
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
}

function EditorSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-slate-100/70 flex items-center justify-center">
      <span className="text-slate-500">Loading editor...</span>
    </div>
  )
}

function EditablePromptText({
  value,
  onChange,
  placeholder,
  minHeightClass = 'min-h-[120px]',
  mono = false,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  minHeightClass?: string
  mono?: boolean
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!ref.current || isFocusedRef.current) return
    if (ref.current.innerText !== value) {
      ref.current.innerText = value
    }
  }, [value])

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
          isFocusedRef.current = true
        }}
        onBlur={(e) => {
          isFocusedRef.current = false
          onChange((e.currentTarget.innerText || '').replace(/\u00a0/g, ' '))
        }}
        onInput={(e) => {
          onChange((e.currentTarget.textContent || '').replace(/\u00a0/g, ' '))
        }}
      />
    </div>
  )
}

function PromptSection({
  icon,
  title,
  subtitle,
  children,
  tone,
  actions,
}: {
  icon: ReactNode
  title: string
  subtitle: string
  children: ReactNode
  tone: 'system' | 'user' | 'example' | 'context' | 'runtime'
  actions?: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(true)

  const toneClasses =
    tone === 'system'
      ? 'border-sky-200/90 bg-sky-50/70'
      : tone === 'user'
        ? 'border-violet-200/90 bg-violet-50/70'
        : tone === 'example'
          ? 'border-emerald-200/90 bg-emerald-50/70'
          : tone === 'runtime'
            ? 'border-amber-200/90 bg-amber-50/70'
            : 'border-indigo-200/90 bg-indigo-50/70'

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
            <div className="flex items-center gap-2">
              <span className="rounded-md border border-white/70 bg-white/85 p-1 text-slate-600">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </span>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="pt-3">
          {actions && <div className="mb-3">{actions}</div>}
          {children}
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}

export function AgentEditorPane({
  agentId,
  onDirtyChange,
  onHistoryToggle,
  isHistoryOpen,
}: AgentEditorPaneProps) {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE)
  const [originalState, setOriginalState] = useState<FormState>(DEFAULT_FORM_STATE)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [jsonErrors, setJsonErrors] = useState<Record<string, string | null>>({})
  const [registry, setRegistry] = useState<RegistryMetadata | null>(null)
  const registryFetched = useRef(false)

  useEffect(() => {
    if (registryFetched.current) return
    registryFetched.current = true

    async function fetchRegistry() {
      try {
        const response = await fetch('/api/agent-registries')
        const result = await response.json()
        if (result.success && result.data) {
          setRegistry(result.data)
        }
      } catch (err) {
        console.error('Failed to fetch registry:', err)
      }
    }

    fetchRegistry()
  }, [])

  useEffect(() => {
    async function fetchAgent() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/agent-definitions/${encodeURIComponent(agentId)}`)
        const result = await response.json()

        if (result.success && result.data) {
          const data: AdminAgentDefinition = result.data
          const state: FormState = {
            systemPrompt: data.systemPrompt,
            userPrompt: data.userPrompt || '',
            model: data.model,
            maxTokens: data.maxTokens || 16000,
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
          }
          setFormState(state)
          setOriginalState(state)
          setLastSaved(new Date(data.createdAt))
          setJsonErrors({})
        } else {
          setError('Agent not found')
        }
      } catch (err) {
        setError('Failed to load agent')
        console.error('Failed to fetch agent:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAgent()
  }, [agentId])

  useEffect(() => {
    onDirtyChange(!formStateEquals(formState, originalState))
  }, [formState, originalState, onDirtyChange])

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const parsedExamples = useMemo(() => parseExamples(formState.examplesJson), [formState.examplesJson])

  const setExamples = useCallback((examples: AgentExample[]) => {
    updateField('examplesJson', JSON.stringify(examples, null, 2))
  }, [])

  const updateExample = (index: number, patch: Partial<AgentExample>) => {
    const next = [...parsedExamples]
    next[index] = { ...next[index], ...patch }
    setExamples(next)
  }

  const addExample = () => {
    setExamples([...parsedExamples, { type: 'positive', input: '', output: '', feedback: '' }])
  }

  const removeExample = (index: number) => {
    setExamples(parsedExamples.filter((_, i) => i !== index))
  }

  const validateAndBuildBody = useCallback((): { parsed: Record<string, unknown>; examples: AgentExample[] } | null => {
    const errors: Record<string, string | null> = {}
    const jsonFields = [
      { key: 'subAgentsJson', label: 'Sub-Agents' },
      { key: 'schemaJsonJson', label: 'Output Schema' },
      { key: 'validationRulesJson', label: 'Validation Rules' },
      { key: 'defaultExtensionsJson', label: 'Default Extensions' },
    ] as const

    const parsed: Record<string, unknown> = {}
    let hasError = false

    for (const { key, label } of jsonFields) {
      const str = formState[key]
      if (!str.trim()) {
        parsed[key] = null
        errors[key] = null
      } else {
        const result = safeParse(str)
        if (result.error) {
          errors[key] = `${label}: ${result.error}`
          hasError = true
        } else {
          parsed[key] = result.value
          errors[key] = null
        }
      }
    }

    let examples: AgentExample[] = []
    try {
      const raw = JSON.parse(formState.examplesJson)
      if (!Array.isArray(raw)) {
        errors.examplesJson = 'Examples: expected an array'
        hasError = true
      } else {
        examples = parseExamples(formState.examplesJson)
        errors.examplesJson = null
      }
    } catch (e) {
      errors.examplesJson = `Examples: ${e instanceof Error ? e.message : 'Invalid JSON'}`
      hasError = true
    }

    setJsonErrors(errors)
    if (hasError) return null

    return { parsed, examples }
  }, [formState])

  const handleSave = useCallback(async () => {
    if (formStateEquals(formState, originalState)) return

    const validated = validateAndBuildBody()
    if (!validated) {
      setError('Fix configuration errors before saving')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/agent-definitions/${encodeURIComponent(agentId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt: formState.systemPrompt,
          userPrompt: formState.userPrompt || null,
          model: formState.model,
          maxTokens: formState.maxTokens,
          temperature: '1',
          maxIterations: formState.maxIterations,
          maxRetries: formState.maxRetries,
          description: formState.description || null,
          isActive: formState.isActive,
          toolIds: formState.toolIds.length > 0 ? formState.toolIds : null,
          contextTypes: formState.contextTypes.length > 0 ? formState.contextTypes : null,
          subAgents: validated.parsed.subAgentsJson,
          schemaJson: validated.parsed.schemaJsonJson,
          validationRules: validated.parsed.validationRulesJson,
          userPromptTemplate: formState.userPromptTemplate || null,
          examples: validated.examples,
          evalPrompt: formState.evalPrompt || null,
          evalModel: formState.evalModel || null,
          defaultExtensions: validated.parsed.defaultExtensionsJson,
        }),
      })

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message)
      }

      setOriginalState(formState)
      setLastSaved(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [agentId, formState, originalState, validateAndBuildBody])

  const isDirty = !formStateEquals(formState, originalState)

  return (
    <Card className="flex flex-1 flex-col rounded-2xl border border-slate-200/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.95),rgba(248,250,252,0.95))] shadow-[0_20px_45px_-34px_rgba(15,23,42,0.6)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-slate-300 bg-white/90 text-slate-700">
            {agentId}
          </Badge>
          {isDirty && (
            <Badge variant="destructive" className="animate-pulse bg-rose-100 text-rose-700 border-rose-200">
              Unsaved
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-xs text-slate-500">Last saved: {lastSaved.toLocaleTimeString()}</span>}
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 bg-white/85 text-slate-700 hover:bg-slate-50"
            onClick={onHistoryToggle}
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

      {error && <div className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</div>}

      <div className="p-4">
        {isLoading ? (
          <EditorSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 shadow-inner">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Prompt Assembly</h2>
                  <p className="text-xs text-slate-500">Single-scroll prompt view with editable sections</p>
                </div>
                <Badge className="border-0 bg-slate-800/90 text-white">Concatenated</Badge>
              </div>

              <div className="space-y-4">
                <PromptSection
                  icon={<Bot className="h-4 w-4" />}
                  title="System Prompt"
                  subtitle="Role, constraints, and global behavior"
                  tone="system"
                >
                  <EditablePromptText
                    value={formState.systemPrompt}
                    onChange={(value) => updateField('systemPrompt', value)}
                    placeholder="Define agent behavior and constraints..."
                  />
                </PromptSection>

                <PromptSection
                  icon={<Database className="h-4 w-4" />}
                  title="Context Blocks"
                  subtitle="Selected runtime contexts are injected in this order"
                  tone="context"
                >
                  {formState.contextTypes.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-3 py-2 text-xs text-slate-500">
                      No context blocks selected. Enable context types in the right panel.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formState.contextTypes.map((contextType) => (
                        <div key={contextType} className="rounded-xl border border-indigo-200 bg-white/85 px-3 py-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Context: {contextType}</p>
                          <p className="mt-1 text-sm text-slate-700">
                            Runtime provider injects `{`{${contextType}}`}` content into the prompt during invocation.
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </PromptSection>

                <PromptSection
                  icon={<Sparkles className="h-4 w-4" />}
                  title="Examples"
                  subtitle="Inline examples included in the prompt sequence"
                  tone="example"
                  actions={
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="border-emerald-300 bg-white/85 text-emerald-800 hover:bg-emerald-50"
                      onClick={addExample}
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add Example
                    </Button>
                  }
                >
                  {parsedExamples.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-emerald-300 bg-white/75 px-3 py-2 text-xs text-slate-500">
                      No examples yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {parsedExamples.map((example, index) => (
                        <div key={`${example.type}-${index}`} className="rounded-xl border border-emerald-200 bg-white/90 p-3">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="secondary"
                                className={
                                  example.type === 'negative' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                }
                              >
                                {example.type}
                              </Badge>
                              <Select
                                value={example.type}
                                onValueChange={(value: 'positive' | 'negative') => updateExample(index, { type: value })}
                              >
                                <SelectTrigger className="h-8 w-[130px] border-slate-300 bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="positive">Positive</SelectItem>
                                  <SelectItem value="negative">Negative</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              onClick={() => removeExample(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2 lg:grid-cols-2">
                            <div>
                              <Label className="text-xs text-slate-600">Input</Label>
                              <EditablePromptText
                                value={example.input}
                                onChange={(value) => updateExample(index, { input: value })}
                                placeholder="Example input"
                                minHeightClass="min-h-[95px]"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600">Expected Output</Label>
                              <EditablePromptText
                                value={example.output}
                                onChange={(value) => updateExample(index, { output: value })}
                                placeholder="Example output"
                                minHeightClass="min-h-[95px]"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </PromptSection>

                <PromptSection
                  icon={<MessageSquare className="h-4 w-4" />}
                  title="Conversation Runtime Blocks"
                  subtitle="Preview of appended message history and contact metadata"
                  tone="runtime"
                >
                  <div className="rounded-xl border border-amber-200 bg-white/85 px-3 py-2 text-sm text-slate-700">
                    <p className="font-medium text-amber-800">Previous Messages</p>
                    <p className="mt-1">Appends latest conversation turns from message history store.</p>
                    <p className="mt-2 font-medium text-amber-800">Contact Metadata</p>
                    <p className="mt-1">Includes contact and profile facts available at runtime.</p>
                  </div>
                </PromptSection>

                <PromptSection
                  icon={<Clock3 className="h-4 w-4" />}
                  title="User Prompt Template"
                  subtitle="Optional pre-template before final user input"
                  tone="example"
                >
                  <EditablePromptText
                    value={formState.userPromptTemplate}
                    onChange={(value) => updateField('userPromptTemplate', value)}
                    placeholder="Template with {{variable}} placeholders..."
                  />
                </PromptSection>

                <PromptSection
                  icon={<MessageSquare className="h-4 w-4" />}
                  title="User Prompt"
                  subtitle="Final instruction merged with runtime input"
                  tone="user"
                >
                  <EditablePromptText
                    value={formState.userPrompt}
                    onChange={(value) => updateField('userPrompt', value)}
                    placeholder="Compose the final user-facing instruction..."
                  />
                </PromptSection>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 h-fit">
              <div className="mb-3">
                <h2 className="text-base font-semibold text-slate-900">Configuration</h2>
                <p className="text-xs text-slate-500">Model, tools, and context controls</p>
              </div>

              <div className="space-y-4">
                <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Runtime</h3>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Select value={formState.model} onValueChange={(value) => updateField('model', value)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min={1}
                      max={128000}
                      value={formState.maxTokens}
                      onChange={(e) => updateField('maxTokens', parseInt(e.target.value, 10) || 16000)}
                      className="border-slate-300 bg-white"
                    />
                  </div>
                  <p className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-700">
                    Temperature is fixed to 1 for all agents.
                  </p>
                </section>

                <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-800">Agent Metadata</h3>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formState.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="What this agent does"
                      className="border-slate-300 bg-white"
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <p className="text-sm text-slate-800">Active</p>
                      <p className="text-xs text-slate-500">Use in production routing</p>
                    </div>
                    <Switch checked={formState.isActive} onCheckedChange={(value) => updateField('isActive', value)} />
                  </div>
                </section>

                {registry && (
                  <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                    <div className="mb-2 flex items-center gap-2 text-slate-800">
                      <Wrench className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Tools</h3>
                    </div>
                    <ToolsSection
                      tools={registry.tools}
                      selected={formState.toolIds}
                      onChange={(toolIds) => updateField('toolIds', toolIds)}
                    />
                  </section>
                )}

                {registry && (
                  <section className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                    <div className="mb-2 flex items-center gap-2 text-slate-800">
                      <Database className="h-4 w-4" />
                      <h3 className="text-sm font-semibold">Context</h3>
                    </div>
                    <ContextTypesSection
                      contextTypes={registry.contextTypes}
                      selected={formState.contextTypes}
                      onChange={(contextTypes) => updateField('contextTypes', contextTypes)}
                    />
                  </section>
                )}

                <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-slate-800">Advanced</summary>
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="maxIterations">Max Iterations</Label>
                        <Input
                          id="maxIterations"
                          type="number"
                          min={1}
                          max={50}
                          value={formState.maxIterations}
                          onChange={(e) => updateField('maxIterations', parseInt(e.target.value, 10) || 5)}
                          className="border-slate-300 bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="maxRetries">Max Retries</Label>
                        <Input
                          id="maxRetries"
                          type="number"
                          min={0}
                          max={10}
                          value={formState.maxRetries}
                          onChange={(e) => updateField('maxRetries', parseInt(e.target.value, 10) || 1)}
                          className="border-slate-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="evalModel">Eval Model</Label>
                      <Select value={formState.evalModel} onValueChange={(value) => updateField('evalModel', value)}>
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

                    <div className="space-y-1">
                      <Label>Eval Prompt</Label>
                      <EditablePromptText
                        value={formState.evalPrompt}
                        onChange={(value) => updateField('evalPrompt', value)}
                        placeholder="Define eval rubric prompt..."
                        minHeightClass="min-h-[110px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Default Extensions (JSON)</Label>
                      <EditablePromptText
                        value={formState.defaultExtensionsJson}
                        onChange={(value) => updateField('defaultExtensionsJson', value)}
                        placeholder='{ "experienceLevel": "intermediate" }'
                        minHeightClass="min-h-[90px]"
                        mono
                      />
                      {jsonErrors.defaultExtensionsJson && (
                        <p className="text-xs text-rose-600">{jsonErrors.defaultExtensionsJson}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <Label>Sub-Agents (JSON)</Label>
                      <EditablePromptText
                        value={formState.subAgentsJson}
                        onChange={(value) => updateField('subAgentsJson', value)}
                        placeholder='[{ "agentId": "domain:agent" }]'
                        minHeightClass="min-h-[90px]"
                        mono
                      />
                      {jsonErrors.subAgentsJson && <p className="text-xs text-rose-600">{jsonErrors.subAgentsJson}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label>Output Schema (JSON)</Label>
                      <EditablePromptText
                        value={formState.schemaJsonJson}
                        onChange={(value) => updateField('schemaJsonJson', value)}
                        placeholder='{ "type": "object", "properties": {} }'
                        minHeightClass="min-h-[90px]"
                        mono
                      />
                      {jsonErrors.schemaJsonJson && <p className="text-xs text-rose-600">{jsonErrors.schemaJsonJson}</p>}
                    </div>

                    <div className="space-y-1">
                      <Label>Validation Rules (JSON)</Label>
                      <EditablePromptText
                        value={formState.validationRulesJson}
                        onChange={(value) => updateField('validationRulesJson', value)}
                        placeholder='[{ "type": "required" }]'
                        minHeightClass="min-h-[90px]"
                        mono
                      />
                      {jsonErrors.validationRulesJson && (
                        <p className="text-xs text-rose-600">{jsonErrors.validationRulesJson}</p>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            </aside>
          </div>
        )}
      </div>
    </Card>
  )
}
