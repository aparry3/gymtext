/**
 * Agent Extension Model
 *
 * Represents versioned instructional extensions tied to agent definitions.
 * Insert-only design enables version history.
 */

import type { Insertable, Selectable } from 'kysely';
import type { AgentExtensions, JsonValue } from './_types';

export type AgentExtension = Selectable<AgentExtensions>;
export type NewAgentExtension = Insertable<AgentExtensions>;

/**
 * Convenience type covering all mutable extension fields (excludes PK / audit columns).
 * Used by saveExtension() to accept a partial set of fields.
 */
export interface ExtensionFields {
  systemPrompt: string | null;
  systemPromptMode: string | null;
  userPromptTemplate: string | null;
  userPromptTemplateMode: string | null;
  evalPrompt: string | null;
  evalPromptMode: string | null;
  model: string | null;
  temperature: number | null;
  maxTokens: number | null;
  maxIterations: number | null;
  maxRetries: number | null;
  toolIds: string[] | null;
  contextTypes: string[] | null;
  schemaJson: JsonValue | null;
  validationRules: JsonValue | null;
  subAgents: JsonValue | null;
  examples: JsonValue | null;
  triggerConditions: JsonValue | null;
  description: string | null;
}
