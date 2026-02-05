/**
 * Agent Config Model
 *
 * Represents unified agent configuration stored in the database.
 * Combines prompts (system, user) with model configuration.
 *
 * Insert-only design enables version history and rollback.
 * Context prompts remain in the prompts table (fetched dynamically).
 */

import type { Insertable, Selectable } from 'kysely';
import type { AgentConfigs } from './_types';
import type { ModelId } from '../agents/types';

// Database types
export type AgentConfigDB = Selectable<AgentConfigs>;
export type NewAgentConfigDB = Insertable<AgentConfigs>;

/**
 * Domain type for agent configuration
 * Used by services and agents
 */
export interface AgentConfig {
  id: string;

  // Prompts (context fetched separately via PromptService.getContextPrompt())
  systemPrompt: string;
  userPrompt: string | null;

  // Model configuration (null = use defaults)
  model: ModelId | null;
  temperature: number | null;
  maxTokens: number | null;
  maxIterations: number | null;

  // Versioning
  createdAt: Date;
}

/**
 * Input for creating a new agent config version
 */
export interface NewAgentConfig {
  id: string;
  systemPrompt: string;
  userPrompt?: string | null;
  model?: ModelId | null;
  temperature?: number | null;
  maxTokens?: number | null;
  maxIterations?: number | null;
}

/**
 * Partial update for agent config
 * Used when only updating specific fields
 */
export interface AgentConfigUpdate {
  systemPrompt?: string;
  userPrompt?: string | null;
  model?: ModelId | null;
  temperature?: number | null;
  maxTokens?: number | null;
  maxIterations?: number | null;
}

/**
 * Convert database record to domain model
 */
export function toAgentConfig(record: AgentConfigDB): AgentConfig {
  return {
    id: record.id,
    systemPrompt: record.systemPrompt,
    userPrompt: record.userPrompt ?? null,
    model: record.model as ModelId | null,
    temperature: record.temperature ? parseFloat(record.temperature) : null,
    maxTokens: record.maxTokens ?? null,
    maxIterations: record.maxIterations ?? null,
    createdAt: record.createdAt,
  };
}

/**
 * Convert domain model to database insert
 */
export function toNewAgentConfigDB(config: NewAgentConfig): NewAgentConfigDB {
  return {
    id: config.id,
    systemPrompt: config.systemPrompt,
    userPrompt: config.userPrompt ?? null,
    model: config.model ?? null,
    temperature: config.temperature ?? null,
    maxTokens: config.maxTokens ?? null,
    maxIterations: config.maxIterations ?? null,
  };
}
