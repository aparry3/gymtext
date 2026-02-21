'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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
  ChevronDown,
  ChevronRight,
  Save,
  RefreshCw,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
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
}

type AgentCategory = 'workouts' | 'plans' | 'weeks' | 'profiles' | 'other'

interface CategoryGroup {
  key: AgentCategory
  label: string
  agents: Agent[]
}

// Get category from agent ID
function getAgentCategory(agentId: string): AgentCategory {
  if (agentId.startsWith('workout:')) return 'workouts'
  if (agentId.startsWith('plan:')) return 'plans'
  if (agentId.startsWith('week:')) return 'weeks'
  if (agentId.startsWith('profile:')) return 'profiles'
  return 'other'
}

// Group agents by category
function groupAgentsByCategory(agents: Agent[]): CategoryGroup[] {
  const groups: Record<AgentCategory, Agent[]> = {
    workouts: [],
    plans: [],
    weeks: [],
    profiles: [],
    other: [],
  }

  agents.forEach(agent => {
    const category = getAgentCategory(agent.agent_id)
    groups[category].push(agent)
  })

  const categoryLabels: Record<AgentCategory, string> = {
    workouts: 'Workouts',
    plans: 'Plans',
    weeks: 'Weeks',
    profiles: 'Profiles',
    other: 'Other',
  }

  return (Object.keys(groups) as AgentCategory[])
    .filter(key => groups[key].length > 0)
    .map(key => ({
      key,
      label: categoryLabels[key],
      agents: groups[key],
    }))
}

// Available models
const MODELS = [
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'o1', label: 'O1' },
  { value: 'o1-mini', label: 'O1 Mini' },
  { value: 'o3-mini', label: 'O3 Mini' },
]

export default function AgentsPage() {
  const { mode } = useEnvironment()
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<AgentCategory>>(
    new Set(['workouts', 'plans', 'weeks', 'profiles'])
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable form state
  const [formData, setFormData] = useState<Partial<Agent>>({})

  // Fetch agents
  const fetchAgents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/agents')
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to fetch agents')
      }

      setAgents(result.data.agents)
      
      // Auto-select first agent if none selected
      if (!selectedAgentId && result.data.agents.length > 0) {
        setSelectedAgentId(result.data.agents[0].agent_id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [selectedAgentId])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  // Update form data when selected agent changes
  useEffect(() => {
    const agent = agents.find(a => a.agent_id === selectedAgentId)
    if (agent) {
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
    }
  }, [selectedAgentId, agents])

  // Group agents by category
  const categoryGroups = useMemo(() => groupAgentsByCategory(agents), [agents])

  // Get selected agent
  const selectedAgent = useMemo(
    () => agents.find(a => a.agent_id === selectedAgentId),
    [agents, selectedAgentId]
  )

  // Toggle category expansion
  const toggleCategory = (category: AgentCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  // Save agent
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

      // Update local state
      setAgents(prev =>
        prev.map(a =>
          a.agent_id === selectedAgentId
            ? { ...a, ...result.data }
            : a
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

  // Handle input change
  const handleInputChange = (field: keyof Agent, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Bot className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-semibold">Agents</h1>
          <span className="text-sm text-muted-foreground">
            ({mode})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAgents}
            disabled={isLoading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && agents.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Main content - Two Panel Layout */}
      {!isLoading && agents.length > 0 && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Agent List */}
          <div className="w-80 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">
                Agent Categories
              </h2>
              
              {categoryGroups.map(group => (
                <div key={group.key} className="mb-2">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(group.key)}
                    className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {expandedCategories.has(group.key) ? (
                      <ChevronDown className="w-4 h-4 mr-2" />
                    ) : (
                      <ChevronRight className="w-4 h-4 mr-2" />
                    )}
                    {group.label}
                    <span className="ml-auto text-xs text-gray-500">
                      {group.agents.length}
                    </span>
                  </button>

                  {/* Agent List */}
                  {expandedCategories.has(group.key) && (
                    <div className="ml-4 mt-1 space-y-1">
                      {group.agents.map(agent => (
                        <button
                          key={agent.agent_id}
                          onClick={() => setSelectedAgentId(agent.agent_id)}
                          className={cn(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                            selectedAgentId === agent.agent_id
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : 'hover:bg-gray-100 text-gray-700'
                          )}
                        >
                          <div className="font-medium truncate">
                            {agent.agent_id.split(':')[1] || agent.agent_id}
                          </div>
                          {agent.description && (
                            <div className="text-xs text-gray-500 truncate mt-0.5">
                              {agent.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Agent Details */}
          {selectedAgent && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Agent Info Header */}
              <div className="px-6 py-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedAgent.agent_id}
                    </h2>
                    {selectedAgent.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedAgent.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={cn(
                      'min-w-[100px]',
                      saveSuccess && 'bg-green-600 hover:bg-green-700'
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
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 space-y-6">
                  {/* Prompt Editing Section (A05) */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Prompts
                    </h3>

                    {/* System Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        System Prompt
                      </label>
                      <textarea
                        value={formData.system_prompt || ''}
                        onChange={e => handleInputChange('system_prompt', e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y"
                        placeholder="Enter system prompt..."
                      />
                    </div>

                    {/* Examples */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Examples
                      </label>
                      <textarea
                        value={formData.examples || ''}
                        onChange={e => handleInputChange('examples', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y"
                        placeholder="Enter examples (JSON or text)..."
                      />
                    </div>

                    {/* User Prompt Template */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        User Prompt Template
                      </label>
                      <textarea
                        value={formData.user_prompt_template || ''}
                        onChange={e => handleInputChange('user_prompt_template', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono resize-y"
                        placeholder="Enter user prompt template..."
                      />
                    </div>
                  </div>

                  {/* Configuration Panel (A06) */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                      Configuration
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Model
                        </label>
                        <Select
                          value={formData.model}
                          onValueChange={value => handleInputChange('model', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MODELS.map(model => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Max Tokens */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Max Tokens
                        </label>
                        <Input
                          type="number"
                          value={formData.max_tokens || 0}
                          onChange={e => handleInputChange('max_tokens', parseInt(e.target.value) || 0)}
                          min={0}
                          max={100000}
                        />
                      </div>

                      {/* Temperature */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Temperature: {formData.temperature?.toFixed(1) || '1.0'}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={formData.temperature || 1}
                          onChange={e => handleInputChange('temperature', parseFloat(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>0</span>
                          <span>1</span>
                          <span>2</span>
                        </div>
                      </div>

                      {/* Max Iterations */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Max Iterations
                        </label>
                        <Input
                          type="number"
                          value={formData.max_iterations || 0}
                          onChange={e => handleInputChange('max_iterations', parseInt(e.target.value) || 0)}
                          min={1}
                          max={100}
                        />
                      </div>

                      {/* Max Retries */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Max Retries
                        </label>
                        <Input
                          type="number"
                          value={formData.max_retries || 0}
                          onChange={e => handleInputChange('max_retries', parseInt(e.target.value) || 0)}
                          min={0}
                          max={10}
                        />
                      </div>

                      {/* Tool IDs */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Tool IDs
                        </label>
                        <Input
                          value={(formData.tool_ids || []).join(', ')}
                          onChange={e => handleInputChange('tool_ids', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                          placeholder="tool1, tool2, tool3"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Comma-separated list of tool IDs
                        </p>
                      </div>
                    </div>
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
