import type { Message } from '@/server/agents/types';
import type { InputMapping, ValidationRule } from '../declarative/types';

/**
 * Parameters for AgentRunner.invoke()
 */
export interface AgentInvokeParams {
  /** The user's input message (replaces 'message') */
  input?: string;
  /** Opaque parameter bag — carries user, extras, and any caller-provided data */
  params?: Record<string, unknown>;
  /** Previous conversation messages */
  previousMessages?: Message[];
  /** Manual context injection (prepended to resolved context) */
  context?: string[];
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
  /** JSON Schema for structured output */
  schemaJson: Record<string, unknown> | null;
  /** Declarative validation rules */
  validationRules: ValidationRule[] | null;
  /** User prompt template with {{variable}} substitution */
  userPromptTemplate: string | null;
  /** Few-shot examples for the agent */
  examples: unknown[] | null;
}
