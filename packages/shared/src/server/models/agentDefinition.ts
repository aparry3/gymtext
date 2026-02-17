/**
 * Agent Definition Model
 *
 * Represents database-driven agent configurations.
 * Simplified for the new dossier-based agent architecture.
 */

import type { Insertable, Selectable, Updateable } from 'kysely';
import type { AgentDefinitions } from './_types';

// Database types
export type AgentDefinition = Selectable<AgentDefinitions>;
export type NewAgentDefinition = Insertable<AgentDefinitions>;
export type AgentDefinitionUpdate = Updateable<AgentDefinitions>;

/**
 * Database-loaded agent configuration
 * Used by the agent runner when loading agent definitions
 */
export interface DbAgentConfig {
  /** System prompt instructions */
  systemPrompt: string;
  /** User prompt template with {{variable}} substitution */
  userPromptTemplate: string | null;
  /** Model identifier (e.g., 'gpt-5-nano') */
  model: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Temperature for generation (0-2) */
  temperature: number;
  /** Maximum iterations for tool loops */
  maxIterations: number;
  /** Tool IDs available to this agent */
  toolIds: string[] | null;
  /** Example messages for few-shot prompting */
  examples: unknown | null;
  /** Eval rubric for quality assessment */
  evalRubric: string | null;
}
