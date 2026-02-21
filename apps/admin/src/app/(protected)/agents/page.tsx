'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { useEnvironment } from '@/context/EnvironmentContext'
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
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Save,
  SlidersHorizontal,
  Sparkles,
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
  context_types: string | null
  created_at?: string
  version_id?: number
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
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'o1', label: 'O1' },
  { value: 'o1-mini', label: 'O1 Mini' },
  { value: 'o3-mini', label: 'O3 Mini' },
]

interface AutoGrowTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'value'> {
  value: string
  minHeight?: number
}

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

export default function AgentsPage() {
  const { mode } = useEnvironment()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['workout', 'week', 'plan', 'profile']))
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [formData, setFormData] = useState<Partial<Agent>>({})

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

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

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
      description: agent.description || '',
    })
  }, [selectedAgentId, agents])

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
              <p className="text-sm text-slate-500">Inspect latest prompt versions by category · {mode}</p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={fetchAgents} disabled={isLoading}>
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
                            onClick={() => setSelectedAgentId(agent.agent_id)}
                            className={cn(
                              'w-full rounded-lg border px-3 py-2 text-left transition-all',
                              selectedAgentId === agent.agent_id
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
            </div>
          </aside>

          {selectedAgent && (
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
                      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                        <Bot className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-semibold text-slate-800">Prompt Editors</h3>
                      </div>

                      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-5">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">System Prompt</label>
                          <AutoGrowTextarea
                            value={formData.system_prompt || ''}
                            onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                            minHeight={280}
                            placeholder="Enter system prompt..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Examples</label>
                          <AutoGrowTextarea
                            value={formData.examples || ''}
                            onChange={(e) => handleInputChange('examples', e.target.value)}
                            minHeight={220}
                            placeholder="Enter examples (JSON or text)..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">User Prompt Template</label>
                          <AutoGrowTextarea
                            value={formData.user_prompt_template || ''}
                            onChange={(e) => handleInputChange('user_prompt_template', e.target.value)}
                            minHeight={260}
                            placeholder="Enter user prompt template..."
                          />
                        </div>
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

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tool IDs</label>
                          <Input
                            value={(formData.tool_ids || []).join(', ')}
                            onChange={(e) =>
                              handleInputChange(
                                'tool_ids',
                                e.target.value
                                  .split(',')
                                  .map((tool) => tool.trim())
                                  .filter(Boolean)
                              )
                            }
                            placeholder="tool1, tool2, tool3"
                            className="bg-white"
                          />
                          <p className="text-xs text-slate-500 mt-1">Comma-separated list of tools enabled for this agent</p>
                        </div>

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
