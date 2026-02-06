import type { UserWithProfile } from '@/server/models/user';
import type { Message } from '@/server/agents/types';
import type { ContextExtras } from '@/server/services/context/types';
import type { InputMapping, ValidationRule } from '../declarative/types';
import type { HookableConfig, HookConfigOrString } from '../hooks/types';

/**
 * Parameters for AgentRunner.invoke()
 */
export interface AgentInvokeParams {
  /** The current user */
  user: UserWithProfile;
  /** The user's input message */
  message?: string;
  /** Previous conversation messages */
  previousMessages?: Message[];
  /** Extra context data (workoutDate, targetDay, etc.) */
  extras?: ContextExtras;
}

/**
 * Sub-agent configuration stored in sub_agents JSONB column
 */
export interface SubAgentDbConfig {
  /** Sequential batch ordering (0, 1, 2...) */
  batch: number;
  /** Result property name on composed output */
  key: string;
  /** agent_definitions.agent_id to invoke */
  agentId: string;
  /** Declarative transform: maps parent output to sub-agent input */
  inputMapping?: InputMapping;
  /** Declarative condition: rules that must pass for sub-agent to run */
  condition?: ValidationRule[];
  /** Hook to execute after this sub-agent completes */
  postHook?: HookConfigOrString;
}

/**
 * Extended agent config from the new DB columns
 */
export interface ExtendedAgentConfig {
  /** Tool IDs available to this agent */
  toolIds: string[] | null;
  /** Context types to resolve for this agent */
  contextTypes: string[] | null;
  /** Sub-agent configurations */
  subAgents: SubAgentDbConfig[] | null;
  /** Agent-level hooks */
  hooks: HookableConfig | null;
  /** Per-tool hook configs */
  toolHooks: Record<string, HookableConfig> | null;
  /** JSON Schema for structured output */
  schemaJson: Record<string, unknown> | null;
  /** Declarative validation rules */
  validationRules: ValidationRule[] | null;
  /** User prompt template with {{variable}} substitution */
  userPromptTemplate: string | null;
}
