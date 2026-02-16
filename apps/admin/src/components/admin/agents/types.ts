/**
 * Agent Definition Types for Admin UI
 */

export interface AgentExample {
  type: 'positive' | 'negative';
  input: string;
  output: string;
  feedback?: string;
}

export interface AdminAgentDefinition {
  versionId: number;
  agentId: string;
  systemPrompt: string;
  userPrompt: string | null;
  model: string;
  maxTokens: number | null;
  temperature: string | null;
  maxIterations: number | null;
  maxRetries: number | null;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  toolIds: string[] | null;
  contextTypes: string[] | null;
  subAgents: unknown[] | null;
  schemaJson: Record<string, unknown> | null;
  validationRules: unknown[] | null;
  userPromptTemplate: string | null;
  examples: AgentExample[] | null;
  evalPrompt: string | null;
  evalModel: string | null;
  defaultExtensions: Record<string, string> | null;
}

export interface RegistryToolMetadata {
  name: string;
  description: string;
  priority?: number;
}

export interface RegistryMetadata {
  tools: RegistryToolMetadata[];
  contextTypes: string[];
  agentIds: string[];
}

export interface AgentDomain {
  id: string;
  label: string;
  agents: AgentConfig[];
}

export interface AgentConfig {
  id: string;
  label: string;
}

export interface SelectedAgent {
  agentId: string;
}

export interface AdminAgentExtension {
  agentId: string;
  extensionType: string;
  extensionKey: string;
  systemPrompt: string | null;
  systemPromptMode: string | null;
  userPromptTemplate: string | null;
  userPromptTemplateMode: string | null;
  evalPrompt: string | null;
  evalPromptMode: string | null;
  model: string | null;
  temperature: string | null;
  maxTokens: number | null;
  maxIterations: number | null;
  maxRetries: number | null;
  toolIds: string[] | null;
  contextTypes: string[] | null;
  schemaJson: Record<string, unknown> | null;
  validationRules: unknown[] | null;
  subAgents: unknown[] | null;
  examples: unknown[] | null;
  triggerConditions: unknown[] | null;
  description: string | null;
  createdAt: string;
}

/**
 * Agent domains for grouping in the tree view
 * Matches the 22 agents defined in the plan
 */
export const AGENT_DOMAINS: AgentDomain[] = [
  {
    id: 'chat',
    label: 'Chat',
    agents: [
      { id: 'chat:generate', label: 'Generate' },
    ],
  },
  {
    id: 'profile',
    label: 'Profile',
    agents: [
      { id: 'profile:fitness', label: 'Fitness' },
      { id: 'profile:structured', label: 'Structured' },
      { id: 'profile:user', label: 'User' },
    ],
  },
  {
    id: 'plan',
    label: 'Plans',
    agents: [
      { id: 'plan:generate', label: 'Generate' },
      { id: 'plan:structured', label: 'Structured' },
      { id: 'plan:message', label: 'Message' },
      { id: 'plan:modify', label: 'Modify' },
    ],
  },
  {
    id: 'workout',
    label: 'Workouts',
    agents: [
      { id: 'workout:generate', label: 'Generate' },
      { id: 'workout:structured', label: 'Structured' },
      { id: 'workout:structured:validate', label: 'Validate' },
      { id: 'workout:message', label: 'Message' },
      { id: 'workout:modify', label: 'Modify' },
    ],
  },
  {
    id: 'microcycle',
    label: 'Microcycles',
    agents: [
      { id: 'microcycle:generate', label: 'Generate' },
      { id: 'microcycle:structured', label: 'Structured' },
      { id: 'microcycle:message', label: 'Message' },
      { id: 'microcycle:modify', label: 'Modify' },
    ],
  },
  {
    id: 'modifications',
    label: 'Modifications',
    agents: [
      { id: 'modifications:router', label: 'Router (deprecated)' },
    ],
  },
  {
    id: 'program',
    label: 'Programs',
    agents: [
      { id: 'program:parse', label: 'Parse' },
    ],
  },
  {
    id: 'messaging',
    label: 'Messaging',
    agents: [
      { id: 'messaging:plan-summary', label: 'Plan Summary' },
      { id: 'messaging:plan-ready', label: 'Plan Ready' },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    agents: [
      { id: 'blog:metadata', label: 'Metadata' },
    ],
  },
];

/**
 * Available model options
 */
export const MODEL_OPTIONS = [
  { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
  { value: 'gpt-5.1', label: 'GPT-5.1' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
];
