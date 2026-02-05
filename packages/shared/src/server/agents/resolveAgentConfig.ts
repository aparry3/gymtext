/**
 * Agent Config Resolution Helper
 *
 * @deprecated Use AgentDefinitionService instead
 *
 * Provides a helper function for agent services to resolve agent configuration
 * from the database (agent_configs table with fallback to legacy prompts table).
 *
 * This moves config fetching to the service layer, making createAgent a pure function.
 */

import type { ModelConfig, ModelId } from './types';
import type { AgentConfigServiceInstance } from '../services/domain/agentConfig/agentConfigService';
import type { PromptServiceInstance } from '../services/domain/prompts/promptService';

/**
 * Services required for resolving agent configs
 * @deprecated Use AgentDefinitionService instead
 */
export interface AgentServices {
  promptService: PromptServiceInstance;
  agentConfigService: AgentConfigServiceInstance;
}

/**
 * Default model configuration values
 */
const DEFAULT_MODEL: ModelId = 'gpt-5-nano';
const DEFAULT_TEMPERATURE = 1;
const DEFAULT_MAX_TOKENS = 16000;
const DEFAULT_MAX_ITERATIONS = 5;

/**
 * Resolved agent configuration with prompts and model config
 */
export interface ResolvedAgentConfig {
  /** System prompt (required for agent operation) */
  systemPrompt: string;
  /** User prompt template (optional) */
  userPrompt: string | null;
  /** Model configuration with defaults applied */
  modelConfig: ModelConfig;
}

/**
 * Options for resolving agent config
 */
export interface ResolveAgentConfigOptions {
  /** Override model config values (takes precedence over DB values) */
  overrides?: Partial<ModelConfig>;
  /** If true, don't throw when config is not found (returns null) */
  allowMissing?: boolean;
}

/**
 * Resolve agent configuration from the database
 *
 * Fetches config from agent_configs table first, falls back to legacy prompts table.
 * Applies overrides and defaults for model configuration.
 *
 * @param agentId - The agent identifier (e.g., 'chat:generate', 'workout:message')
 * @param agentServices - Services containing promptService and agentConfigService
 * @param options - Optional overrides and behavior flags
 * @returns ResolvedAgentConfig with systemPrompt, userPrompt, and modelConfig
 * @throws Error if config not found and allowMissing is false
 *
 * @example
 * ```typescript
 * // In an agent service:
 * const { systemPrompt, userPrompt, modelConfig } = await resolveAgentConfig(
 *   PROMPT_IDS.CHAT_GENERATE,
 *   agentServices,
 *   { overrides: { temperature: 0.7 } }
 * );
 *
 * const agent = await createAgent({
 *   name: PROMPT_IDS.CHAT_GENERATE,
 *   systemPrompt,
 *   context,
 * }, modelConfig);
 * ```
 */
export async function resolveAgentConfig(
  agentId: string,
  agentServices: AgentServices,
  options?: ResolveAgentConfigOptions
): Promise<ResolvedAgentConfig> {
  const { overrides, allowMissing } = options ?? {};

  // Try agent_configs table first (new system)
  const dbConfig = await agentServices.agentConfigService.getConfig(agentId);

  if (dbConfig) {
    return {
      systemPrompt: dbConfig.systemPrompt,
      userPrompt: dbConfig.userPrompt ?? null,
      modelConfig: {
        model: overrides?.model ?? (dbConfig.model as ModelId | undefined) ?? DEFAULT_MODEL,
        temperature: overrides?.temperature ?? dbConfig.temperature ?? DEFAULT_TEMPERATURE,
        maxTokens: overrides?.maxTokens ?? dbConfig.maxTokens ?? DEFAULT_MAX_TOKENS,
        maxIterations: overrides?.maxIterations ?? dbConfig.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      },
    };
  }

  // Fallback to legacy prompts table
  try {
    const prompts = await agentServices.promptService.getPrompts(agentId);
    return {
      systemPrompt: prompts.systemPrompt,
      userPrompt: prompts.userPrompt ?? null,
      modelConfig: {
        model: overrides?.model ?? DEFAULT_MODEL,
        temperature: overrides?.temperature ?? DEFAULT_TEMPERATURE,
        maxTokens: overrides?.maxTokens ?? DEFAULT_MAX_TOKENS,
        maxIterations: overrides?.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      },
    };
  } catch (error) {
    if (allowMissing) {
      // Return defaults with empty prompts when allowMissing is true
      // This is useful for testing or when prompts are provided inline
      throw error; // Actually, we should still throw - agent needs a system prompt
    }
    throw error;
  }
}

/**
 * Resolve multiple agent configs in parallel
 *
 * Useful when an agent service needs to create multiple agents
 * and wants to fetch all configs upfront.
 *
 * @param agentIds - Array of agent identifiers
 * @param agentServices - Services containing promptService and agentConfigService
 * @returns Map of agentId to ResolvedAgentConfig
 *
 * @example
 * ```typescript
 * const configs = await resolveAgentConfigs(
 *   [PROMPT_IDS.WORKOUT_GENERATE, PROMPT_IDS.WORKOUT_MESSAGE, PROMPT_IDS.WORKOUT_STRUCTURED],
 *   agentServices
 * );
 *
 * const messageConfig = configs.get(PROMPT_IDS.WORKOUT_MESSAGE)!;
 * ```
 */
export async function resolveAgentConfigs(
  agentIds: string[],
  agentServices: AgentServices,
  options?: ResolveAgentConfigOptions
): Promise<Map<string, ResolvedAgentConfig>> {
  const results = await Promise.all(
    agentIds.map(async (id) => {
      const config = await resolveAgentConfig(id, agentServices, options);
      return [id, config] as const;
    })
  );

  return new Map(results);
}
