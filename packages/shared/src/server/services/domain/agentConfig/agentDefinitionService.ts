/**
 * Agent Definition Service
 *
 * Provides a single method to fetch full agent definitions (prompts + model config)
 * from the database. This replaces the resolveAgentConfig helper in the agents layer.
 *
 * Flow:
 * 1. Try agent_configs table first
 * 2. Fall back to legacy prompts table if no config exists
 * 3. Apply defaults for any missing model configuration
 */

import type { AgentConfigServiceInstance } from './agentConfigService';
import type { PromptServiceInstance } from '../prompts/promptService';
import type { ModelId } from '../../../agents/types';

/**
 * Default model configuration values
 */
const DEFAULT_MODEL: ModelId = 'gpt-5-nano';
const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MAX_TOKENS = 16000;
const DEFAULT_MAX_ITERATIONS = 5;

/**
 * Agent definition returned by the service
 * Contains everything needed to create an agent (prompts + model config)
 */
export interface AgentDefinition {
  /** Agent ID (e.g., 'chat:generate') */
  name: string;
  /** System prompt (required for agent operation) */
  systemPrompt: string;
  /** User prompt template (optional) */
  userPrompt: string | null;
  /** Model to use */
  model: ModelId;
  /** Temperature for sampling */
  temperature: number;
  /** Max tokens for response */
  maxTokens: number;
  /** Max iterations for tool loops */
  maxIterations: number;
}

/**
 * Options for fetching an agent definition
 */
export interface GetDefinitionOptions {
  /** Override values (takes precedence over DB values) */
  overrides?: Partial<Omit<AgentDefinition, 'name'>>;
}

/**
 * AgentDefinitionServiceInstance interface
 */
export interface AgentDefinitionServiceInstance {
  /**
   * Get the full definition for an agent
   *
   * @param agentId - The agent identifier (e.g., 'chat:generate')
   * @param options - Optional overrides
   * @returns Full agent definition with prompts and model config
   * @throws Error if no config/prompts found for the agent
   */
  getDefinition(agentId: string, options?: GetDefinitionOptions): Promise<AgentDefinition>;

  /**
   * Get multiple definitions in parallel
   *
   * @param agentIds - Array of agent identifiers
   * @param options - Optional overrides (applied to all)
   * @returns Map of agentId to AgentDefinition
   */
  getDefinitions(agentIds: string[], options?: GetDefinitionOptions): Promise<Map<string, AgentDefinition>>;
}

/**
 * Create an AgentDefinitionService instance
 *
 * @param agentConfigService - Service for fetching from agent_configs table
 * @param promptService - Service for fetching from legacy prompts table
 * @returns AgentDefinitionServiceInstance
 */
export function createAgentDefinitionService(
  agentConfigService: AgentConfigServiceInstance,
  promptService: PromptServiceInstance
): AgentDefinitionServiceInstance {
  return {
    async getDefinition(agentId, options): Promise<AgentDefinition> {
      const { overrides } = options ?? {};

      // Try agent_configs table first (new system)
      const dbConfig = await agentConfigService.getConfig(agentId);

      if (dbConfig) {
        return {
          name: agentId,
          systemPrompt: overrides?.systemPrompt ?? dbConfig.systemPrompt,
          userPrompt: overrides?.userPrompt !== undefined
            ? overrides.userPrompt
            : dbConfig.userPrompt ?? null,
          model: overrides?.model ?? dbConfig.model ?? DEFAULT_MODEL,
          temperature: overrides?.temperature ?? dbConfig.temperature ?? DEFAULT_TEMPERATURE,
          maxTokens: overrides?.maxTokens ?? dbConfig.maxTokens ?? DEFAULT_MAX_TOKENS,
          maxIterations: overrides?.maxIterations ?? dbConfig.maxIterations ?? DEFAULT_MAX_ITERATIONS,
        };
      }

      // Fallback to legacy prompts table
      const prompts = await promptService.getPrompts(agentId);

      return {
        name: agentId,
        systemPrompt: overrides?.systemPrompt ?? prompts.systemPrompt,
        userPrompt: overrides?.userPrompt !== undefined
          ? overrides.userPrompt
          : prompts.userPrompt ?? null,
        model: overrides?.model ?? DEFAULT_MODEL,
        temperature: overrides?.temperature ?? DEFAULT_TEMPERATURE,
        maxTokens: overrides?.maxTokens ?? DEFAULT_MAX_TOKENS,
        maxIterations: overrides?.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      };
    },

    async getDefinitions(agentIds, options): Promise<Map<string, AgentDefinition>> {
      const results = await Promise.all(
        agentIds.map(async (id) => {
          const definition = await this.getDefinition(id, options);
          return [id, definition] as const;
        })
      );

      return new Map(results);
    },
  };
}
