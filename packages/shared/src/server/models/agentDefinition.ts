/**
 * Agent Definition Model
 *
 * Represents database-driven agent configurations.
 * Stores prompts alongside model metadata for runtime configuration.
 */

import type { Insertable, Selectable, Updateable } from 'kysely';
import type { AgentDefinitions } from './_types';

// Database types
export type AgentDefinition = Selectable<AgentDefinitions>;
export type NewAgentDefinition = Insertable<AgentDefinitions>;
export type AgentDefinitionUpdate = Updateable<AgentDefinitions>;

/**
 * Database-loaded agent configuration
 * Used by createAgent() when dbConfig is provided
 */
export interface DbAgentConfig {
  /** System prompt instructions */
  systemPrompt: string;
  /** Optional user prompt template */
  userPrompt: string | null;
  /** Model identifier (e.g., 'gpt-5-nano') */
  model: string;
  /** Maximum tokens for response */
  maxTokens: number;
  /** Temperature for generation (0-2) */
  temperature: number;
  /** Maximum iterations for tool loops */
  maxIterations: number;
  /** Maximum retry attempts on validation failure */
  maxRetries: number;
}
