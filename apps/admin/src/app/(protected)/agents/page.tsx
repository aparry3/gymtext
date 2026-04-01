'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Agent {
  agent_id: string
  description: string | null
  is_active: boolean
  system_prompt: string | null
  user_prompt_template: string | null
  examples: string | null
  model: string
  temperature: number
  max_tokens: number
  max_iterations: number
  max_retries: number
  tool_ids: string[]
  formatter_ids: string[]
  created_at?: string
  version_id?: number
}

interface FormatterData {
  formatter_id: string
  content: string
  description: string | null
  version_id: number
  created_at: string
}

interface CategoryGroup {
  key: string
  label: string
  agents: Agent[]
}

const CATEGORY_LABELS: Record<string, string> = {
  workout: 'Workouts',
  week: 'Weeks',
  plan: 'Plans',
  profile: 'Profiles',
  messaging: 'Messaging',
  chat: 'Chat',
  program: 'Programs',
  blog: 'Blog',
  modifications: 'Modifications',
  other: 'Other',
}

const CATEGORY_ORDER: Record<string, number> = {
  workout: 1,
  week: 2,
  plan: 3,
  profile: 4,
  messaging: 5,
  chat: 6,
  program: 7,
  blog: 8,
  modifications: 9,
  other: 99,
}

function getAgentCategory(agentId: string): string {
  const [category] = agentId.split(':')
  return category || 'other'
}

function getAgentPromptName(agentId: string): string {
  const parts = agentId.split(':')
  if (parts.length <= 1) return agentId
  return parts.slice(1).join(':')
}

function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || `${category.charAt(0).toUpperCase()}${category.slice(1)}`
}

function groupAgentsByCategory(agents: Agent[]): CategoryGroup[] {
  const grouped = new Map<string, Agent[]>()

  agents.forEach((agent) => {
    const category = getAgentCategory(agent.agent_id)
    grouped.set(category, [...(grouped.get(category) || []), agent])
  })

  return Array.from(grouped.entries())
    .sort((a, b) => {
      const left = CATEGORY_ORDER[a[0]] ?? CATEGORY_ORDER.other
      const right = CATEGORY_ORDER[b[0]] ?? CATEGORY_ORDER.other
      if (left !== right) return left - right
      return a[0].localeCompare(b[0])
    })
    .map(([key, categoryAgents]) => ({
      key,
      label: getCategoryLabel(key),
      agents: [...categoryAgents].sort((a, b) => getAgentPromptName(a.agent_id).localeCompare(getAgentPromptName(b.agent_id))),
    }))
}

const MODELS = [
  // GPT-5 family
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5', label: 'GPT-5' },
  { value: 'gpt-5.1', label: 'GPT-5.1' },
  { value: 'gpt-5.2', label: 'GPT-5.2' },
  // Gemini 3 family
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro' },
  { value: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro' },
]

interface AutoGrowTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  value: string
  minHeight?: number
}

type PromptEditorMode = 'edit' | 'preview'

function AutoGrowTextarea({ value, className, onChange, minHeight = 220, ...props }: AutoGrowTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resize = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = '0px'
    textarea.style.height = `${Math.max(textarea.scrollHeight, minHeight)}px`
  }, [minHeight])

  useEffect(() => {
    resize()
  }, [value, resize])

  return (
    <textarea
      {...props}
      ref={textareaRef}
      value={value}
      onChange={(event) => {
        onChange?.(event)
        resize()
      }}
      className={cn(
        'w-full px-3 py-3 text-sm border border-slate-300 rounded-lg bg-slate-50/60 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono resize-none overflow-hidden',
        className
      )}
    />
  )
}

interface MarkdownPromptEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  minHeight: number
  mode: PromptEditorMode
}

function MarkdownPromptEditor({
  label,
  value,
  onChange,
  placeholder,
  minHeight,
  mode,
}: MarkdownPromptEditorProps) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}

      {mode === 'edit' && (
        <AutoGrowTextarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          minHeight={minHeight}
          placeholder={placeholder}
        />
      )}

      {mode === 'preview' && (
        <div
          className="w-full px-3 py-3 text-sm border border-slate-300 rounded-lg bg-white overflow-auto"
          style={{ minHeight }}
        >
          {value.trim() ? (
            <div className="space-y-3 text-slate-800 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:text-lg [&_h3]:font-semibold [&_strong]:font-semibold [&_em]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:py-0.5 [&_pre]:bg-slate-100 [&_pre]:p-3 [&_pre]:rounded-md [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_p]:leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

interface MultiSelectCheckboxProps {
  label: string
  options: { value: string; title?: string; description?: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function MultiSelectCheckbox({ label, options, selected, onChange }: MultiSelectCheckboxProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    )
  }

  const selectedNames = selected
    .map((v) => {
      const opt = options.find((o) => o.value === v)
      return opt?.title || v
    })
    .join(', ')

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <Popover>
        <PopoverTrigger className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors">
          <span className={cn('truncate', selected.length === 0 && 'text-slate-400')}>
            {selected.length > 0 ? selectedNames : 'None'}
          </span>
          <ChevronDown className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
        </PopoverTrigger>
        <PopoverContent align="start" className="max-h-64 overflow-y-auto p-2" style={{ minWidth: 300 }}>
          {options.length === 0 && (
            <p className="text-xs text-slate-400 px-2 py-1">No options available</p>
          )}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-2.5 px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt.value)}
                onChange={() => toggle(opt.value)}
                className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <div className="min-w-0">
                <div className="text-sm text-slate-800 font-medium">{opt.title || opt.value}</div>
                {opt.description && (
                  <div className="text-xs text-slate-500 leading-snug">{opt.description}</div>
                )}
              </div>
            </label>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['workout', 'week', 'plan', 'profile']))
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState<Partial<Agent>>({})

  // Tool options state
  const [availableTools, setAvailableTools] = useState<{ value: string; title?: string; description?: string }[]>([])

  // Panel-level prompt edit/preview mode
  const [promptMode, setPromptMode] = useState<PromptEditorMode>('edit')

  // Formatter state
  const [formatters, setFormatters] = useState<FormatterData[]>([])
  const [formattersExpanded, setFormattersExpanded] = useState(false)
  const [selectedFormatterId, setSelectedFormatterId] = useState<string | null>(null)
  const [formatterFormData, setFormatterFormData] = useState<{ content: string; description: string }>({ content: '', description: '' })
  const [isFormatterSaving, setIsFormatterSaving] = useState(false)
  const [formatterSaveSuccess, setFormatterSaveSuccess] = useState(false)
  const [isCreatingFormatter, setIsCreatingFormatter] = useState(false)
  const [newFormatterId, setNewFormatterId] = useState('')

  // Inline formatter edits (keyed by formatter_id)
  const [formatterEdits, setFormatterEdits] = useState<Record<string, string>>({})

  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agents')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch agents')
      }

      const fetchedAgents: Agent[] = result.data.agents
      setAgents(fetchedAgents)
      setSelectedAgentId((previous) => {
        if (previous && fetchedAgents.some((agent) => agent.agent_id === previous)) {
          return previous
        }

        return fetchedAgents[0]?.agent_id || null
      })

      setExpandedCategories((previous) => {
        if (previous.size > 0) return previous

        const keys = new Set(fetchedAgents.map((agent) => getAgentCategory(agent.agent_id)))
        return keys
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchFormatters = useCallback(async () => {
    try {
      const response = await fetch('/api/formatters')
      const result = await response.json()
      if (response.ok && result.success) {
        setFormatters(result.data.formatters)
      }
    } catch {
      // silently fail — formatters are supplementary
    }
  }, [])

  const fetchTools = useCallback(async () => {
    try {
      const response = await fetch('/api/tools')
      const result = await response.json()
      if (response.ok && result.success) {
        setAvailableTools(
          result.data.tools.map((t: { name: string; title?: string; shortDescription?: string }) => ({
            value: t.name,
            title: t.title,
            description: t.shortDescription,
          }))
        )
      }
    } catch {
      // silently fail — tools are supplementary
    }
  }, [])

  useEffect(() => {
    fetchAgents()
    fetchFormatters()
    fetchTools()
  }, [fetchAgents, fetchFormatters, fetchTools])

  useEffect(() => {
    const agent = agents.find((entry) => entry.agent_id === selectedAgentId)
    if (!agent) return

    setFormData({
      system_prompt: agent.system_prompt || '',
      user_prompt_template: agent.user_prompt_template || '',
      examples: agent.examples || '',
      model: agent.model,
      temperature: agent.temperature,
      max_tokens: agent.max_tokens,
      max_iterations: agent.max_iterations,
      max_retries: agent.max_retries,
      tool_ids: agent.tool_ids || [],
      formatter_ids: agent.formatter_ids || [],
      description: agent.description || '',
    })
  }, [selectedAgentId, agents])

  // Load formatter form data when selecting a formatter
  useEffect(() => {
    const formatter = formatters.find((f) => f.formatter_id === selectedFormatterId)
    if (!formatter) return
    setFormatterFormData({
      content: formatter.content,
      description: formatter.description || '',
    })
  }, [selectedFormatterId, formatters])

  // Sync inline formatter edits when agent, formatter_ids, or formatters change
  useEffect(() => {
    const ids = formData.formatter_ids || []
    if (ids.length === 0) {
      setFormatterEdits({})
      return
    }
    setFormatterEdits((prev) => {
      const next: Record<string, string> = {}
      for (const id of ids) {
        if (prev[id] !== undefined) {
          // Keep existing edit
          next[id] = prev[id]
        } else {
          const f = formatters.find((x) => x.formatter_id === id)
          next[id] = f?.content || ''
        }
      }
      return next
    })
  }, [selectedAgentId, formData.formatter_ids, formatters])

  const categoryGroups = useMemo(() => groupAgentsByCategory(agents), [agents])

  const selectedAgent = useMemo(
    () => agents.find((entry) => entry.agent_id === selectedAgentId),
    [agents, selectedAgentId]
  )

  const toggleCategory = (category: string) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedAgentId) return

    setIsSaving(true)
    setSaveSuccess(false)

    try {
      const response = await fetch(`/api/agents/${selectedAgentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_prompt: formData.system_prompt,
          user_prompt_template: formData.user_prompt_template,
          examples: formData.examples,
          model: formData.model,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens,
          max_iterations: formData.max_iterations,
          description: formData.description,
          tool_ids: formData.tool_ids,
          formatter_ids: formData.formatter_ids,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save agent')
      }

      setAgents((previous) =>
        previous.map((entry) =>
          entry.agent_id === selectedAgentId
            ? { ...entry, ...result.data }
            : entry
        )
      )

      // Save dirty inline formatter edits
      const formatterSavePromises: Promise<void>[] = []
      for (const [id, editedContent] of Object.entries(formatterEdits)) {
        const original = formatters.find((f) => f.formatter_id === id)
        if (original && editedContent !== original.content) {
          formatterSavePromises.push(
            fetch(`/api/formatters/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content: editedContent, description: original.description }),
            }).then((res) => res.json()).then((r) => {
              if (!r.success) throw new Error(r.message || `Failed to save formatter ${id}`)
            })
          )
        }
      }
      if (formatterSavePromises.length > 0) {
        await Promise.all(formatterSavePromises)
        await fetchFormatters()
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Agent, value: unknown) => {
    setFormData((previous) => ({ ...previous, [field]: value }))
  }

  const handleFormatterSave = async () => {
    if (!selectedFormatterId) return

    setIsFormatterSaving(true)
    setFormatterSaveSuccess(false)

    try {
      const response = await fetch(`/api/formatters/${selectedFormatterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: formatterFormData.content,
          description: formatterFormData.description || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to save formatter')
      }

      // Refresh formatters list
      await fetchFormatters()

      setFormatterSaveSuccess(true)
      setTimeout(() => setFormatterSaveSuccess(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save formatter')
    } finally {
      setIsFormatterSaving(false)
    }
  }

  const handleFormatterDelete = async () => {
    if (!selectedFormatterId) return
    if (!confirm(`Deactivate formatter "${selectedFormatterId}"?`)) return

    try {
      const response = await fetch(`/api/formatters/${selectedFormatterId}`, { method: 'DELETE' })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to delete formatter')
      }

      setSelectedFormatterId(null)
      await fetchFormatters()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete formatter')
    }
  }

  const handleCreateFormatter = async () => {
    const id = newFormatterId.trim()
    if (!id) return

    try {
      const response = await fetch('/api/formatters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formatter_id: id,
          content: '# New Formatter\n\nEdit content here.',
          description: null,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to create formatter')
      }

      setNewFormatterId('')
      setIsCreatingFormatter(false)
      await fetchFormatters()
      setSelectedFormatterId(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create formatter')
    }
  }

  return (
    <div className="h-[calc(100dvh-4rem)] md:h-[100dvh] min-h-0 bg-gradient-to-br from-slate-50 via-white to-sky-50/40 flex flex-col overflow-hidden">
      <div className="px-3 md:px-5 py-3 border-b border-slate-200/70 bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center border border-sky-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">Agent Prompt Studio</h1>
              <p className="text-sm text-slate-500">Inspect latest prompt versions by category</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={() => { fetchAgents(); fetchFormatters(); fetchTools() }} disabled={isLoading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-4 md:mx-6 mt-4 p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {isLoading && agents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-sky-600" />
        </div>
      )}

      {!isLoading && agents.length > 0 && (
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <aside className="w-72 lg:w-80 border-r border-slate-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-3 md:p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-slate-800">Agent Categories</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{agents.length}</span>
              </div>

              {categoryGroups.map((group) => (
                <div key={group.key} className="rounded-xl border border-slate-200/80 bg-slate-50/70 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(group.key)}
                    className="w-full px-3 py-2.5 flex items-center text-left hover:bg-slate-100/80 transition-colors"
                  >
                    {expandedCategories.has(group.key) ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 mr-2" />
                    )}
                    <span className="text-sm font-medium text-slate-800">{group.label}</span>
                    <span className="ml-auto text-xs text-slate-500">{group.agents.length}</span>
                  </button>

                  {expandedCategories.has(group.key) && (
                    <div className="p-2 pt-0 space-y-1.5">
                      {group.agents.map((agent) => {
                        const promptName = getAgentPromptName(agent.agent_id)

                        return (
                          <button
                            key={agent.agent_id}
                            onClick={() => { setSelectedAgentId(agent.agent_id); setSelectedFormatterId(null) }}
                            className={cn(
                              'w-full rounded-lg border px-3 py-2 text-left transition-all',
                              selectedAgentId === agent.agent_id && !selectedFormatterId
                                ? 'border-sky-300 bg-sky-100/70 shadow-sm'
                                : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-100/80'
                            )}
                          >
                            <div className="text-sm font-semibold text-slate-900 truncate">{promptName}</div>
                            {agent.description && (
                              <div className="text-xs text-slate-500 truncate mt-0.5">{agent.description}</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Formatters section */}
              <div className="border-t border-slate-200 pt-3 mt-3">
                <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 overflow-hidden">
                  <button
                    onClick={() => setFormattersExpanded(!formattersExpanded)}
                    className="w-full px-3 py-2.5 flex items-center text-left hover:bg-slate-100/80 transition-colors"
                  >
                    {formattersExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-500 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 mr-2" />
                    )}
                    <FileText className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                    <span className="text-sm font-medium text-slate-800">Formatters</span>
                    <span className="ml-auto text-xs text-slate-500">{formatters.length}</span>
                  </button>

                  {formattersExpanded && (
                    <div className="p-2 pt-0 space-y-1.5">
                      {formatters.map((formatter) => (
                        <button
                          key={formatter.formatter_id}
                          onClick={() => { setSelectedFormatterId(formatter.formatter_id); setSelectedAgentId(null) }}
                          className={cn(
                            'w-full rounded-lg border px-3 py-2 text-left transition-all',
                            selectedFormatterId === formatter.formatter_id
                              ? 'border-amber-300 bg-amber-50 shadow-sm'
                              : 'border-transparent bg-white hover:border-slate-200 hover:bg-slate-100/80'
                          )}
                        >
                          <div className="text-sm font-semibold text-slate-900 truncate">{formatter.formatter_id}</div>
                          {formatter.description && (
                            <div className="text-xs text-slate-500 truncate mt-0.5">{formatter.description}</div>
                          )}
                        </button>
                      ))}

                      {isCreatingFormatter ? (
                        <div className="flex gap-1.5 mt-1">
                          <Input
                            value={newFormatterId}
                            onChange={(e) => setNewFormatterId(e.target.value)}
                            placeholder="formatter-id"
                            className="h-8 text-xs bg-white"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCreateFormatter()
                              if (e.key === 'Escape') { setIsCreatingFormatter(false); setNewFormatterId('') }
                            }}
                          />
                          <Button size="sm" className="h-8 px-2" onClick={handleCreateFormatter}>
                            <Check className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsCreatingFormatter(true)}
                          className="w-full rounded-lg border border-dashed border-slate-300 px-3 py-2 text-left text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-colors flex items-center gap-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          New Formatter
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Formatter editor panel */}
          {selectedFormatterId && (
            <div className="flex-1 min-h-0 p-3 md:p-4 overflow-hidden">
              <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col overflow-hidden">
                <div className="px-4 md:px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-white to-amber-50/70 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <p className="text-xs uppercase tracking-wide text-slate-500">Formatter</p>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate">{selectedFormatterId}</h2>
                    {(() => {
                      const f = formatters.find((x) => x.formatter_id === selectedFormatterId)
                      return f ? (
                        <p className="text-xs text-slate-500 mt-1">Version {f.version_id} · {new Date(f.created_at).toLocaleString()}</p>
                      ) : null
                    })()}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFormatterDelete}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={handleFormatterSave}
                      disabled={isFormatterSaving}
                      className={cn(
                        'min-w-[112px] bg-amber-600 hover:bg-amber-700 text-white',
                        formatterSaveSuccess && 'bg-emerald-600 hover:bg-emerald-700'
                      )}
                    >
                      {isFormatterSaving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : formatterSaveSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                    <Input
                      value={formatterFormData.description}
                      onChange={(e) => setFormatterFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Short description of this formatter"
                      className="bg-white"
                    />
                  </div>

                  <MarkdownPromptEditor
                    label="Content"
                    value={formatterFormData.content}
                    onChange={(value) => setFormatterFormData((prev) => ({ ...prev, content: value }))}
                    minHeight={400}
                    placeholder="Formatter content (markdown)..."
                    mode="edit"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Agent editor panel */}
          {selectedAgent && !selectedFormatterId && (
            <div className="flex-1 min-h-0 p-3 md:p-4 overflow-hidden">
              <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] flex flex-col overflow-hidden">
                <div className="px-4 md:px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-white to-sky-50/70 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <p className="text-xs uppercase tracking-wide text-slate-500">Selected Agent</p>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-900 truncate">{selectedAgent.agent_id}</h2>
                    {selectedAgent.description && (
                      <p className="text-sm text-slate-600 mt-1 truncate">{selectedAgent.description}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      'min-w-[112px] bg-sky-600 hover:bg-sky-700 text-white',
                      saveSuccess && 'bg-emerald-600 hover:bg-emerald-700'
                    )}
                  >
                    {isSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex-1 min-h-0 p-3 md:p-4">
                  <div className="h-full min-h-0 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-h-0 rounded-xl border border-slate-200 bg-white flex flex-col">
                      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-sky-600" />
                          <h3 className="text-sm font-semibold text-slate-800">Prompt Editors</h3>
                        </div>
                        <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
                          <button
                            type="button"
                            onClick={() => setPromptMode('edit')}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors',
                              promptMode === 'edit' ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                            )}
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setPromptMode('preview')}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors',
                              promptMode === 'preview' ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                            )}
                          >
                            <Eye className="w-3 h-3" />
                            Preview
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5">
                        <MarkdownPromptEditor
                          label="System Prompt"
                          value={formData.system_prompt || ''}
                          onChange={(value) => handleInputChange('system_prompt', value)}
                          minHeight={280}
                          placeholder="Enter system prompt..."
                          mode={promptMode}
                        />

                        {/* Inline formatter editors — both edit and preview modes */}
                        {(formData.formatter_ids?.length ?? 0) > 0 && (() => {
                          const agentFormatters = formatters.filter((f) =>
                            formData.formatter_ids?.includes(f.formatter_id)
                          )
                          if (agentFormatters.length === 0) return null
                          return (
                            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-800">Formatters</span>
                                <span className="text-xs text-amber-600">({agentFormatters.length} attached)</span>
                              </div>
                              {agentFormatters.map((f) => {
                                const editedContent = formatterEdits[f.formatter_id] ?? f.content
                                const isDirty = editedContent !== f.content
                                return (
                                  <div key={f.formatter_id}>
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <label className="block text-xs font-medium text-amber-700">{f.formatter_id}</label>
                                      {isDirty && (
                                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
                                      )}
                                    </div>
                                    <MarkdownPromptEditor
                                      label=""
                                      value={editedContent}
                                      onChange={(value) =>
                                        setFormatterEdits((prev) => ({ ...prev, [f.formatter_id]: value }))
                                      }
                                      minHeight={180}
                                      placeholder="Formatter content (markdown)..."
                                      mode={promptMode}
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}

                        <MarkdownPromptEditor
                          label="Examples"
                          value={formData.examples || ''}
                          onChange={(value) => handleInputChange('examples', value)}
                          minHeight={220}
                          placeholder="Enter examples (JSON or text)..."
                          mode={promptMode}
                        />

                        <MarkdownPromptEditor
                          label="User Prompt Template"
                          value={formData.user_prompt_template || ''}
                          onChange={(value) => handleInputChange('user_prompt_template', value)}
                          minHeight={260}
                          placeholder="Enter user prompt template..."
                          mode={promptMode}
                        />
                      </div>
                    </section>

                    <aside className="min-h-0 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col">
                      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-semibold text-slate-800">Agent Config</h3>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                          <Input
                            value={formData.description || ''}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Short description"
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
                          <Select
                            value={formData.model}
                            onValueChange={(value) => handleInputChange('model', value)}
                          >
                            <SelectTrigger className="bg-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MODELS.map((model) => (
                                <SelectItem key={model.value} value={model.value}>
                                  {model.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Tokens</label>
                          <Input
                            type="number"
                            value={formData.max_tokens || 0}
                            onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value, 10) || 0)}
                            min={0}
                            max={100000}
                            className="bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Temperature: {formData.temperature?.toFixed(1) || '1.0'}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={formData.temperature || 1}
                            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>0</span>
                            <span>1</span>
                            <span>2</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Iterations</label>
                          <Input
                            type="number"
                            value={formData.max_iterations || 0}
                            onChange={(e) => handleInputChange('max_iterations', parseInt(e.target.value, 10) || 0)}
                            min={1}
                            max={100}
                            className="bg-white"
                          />
                        </div>

                        <MultiSelectCheckbox
                          label="Tool IDs"
                          options={availableTools}
                          selected={formData.tool_ids || []}
                          onChange={(value) => handleInputChange('tool_ids', value)}
                        />

                        <MultiSelectCheckbox
                          label="Formatter IDs"
                          options={formatters.map((f) => ({
                            value: f.formatter_id,
                            description: f.description || undefined,
                          }))}
                          selected={formData.formatter_ids || []}
                          onChange={(value) => handleInputChange('formatter_ids', value)}
                        />

                        <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                          <p>Version: {selectedAgent.version_id ?? 'N/A'}</p>
                          <p>Updated: {selectedAgent.created_at ? new Date(selectedAgent.created_at).toLocaleString() : 'N/A'}</p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
