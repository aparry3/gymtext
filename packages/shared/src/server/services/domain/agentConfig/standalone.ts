/**
 * Standalone AgentDefinitionService Factory
 *
 * For API routes that don't use the full service factory.
 * Creates a singleton AgentDefinitionService using production database.
 */

import type { AgentDefinitionServiceInstance } from './agentDefinitionService';
import type { AgentConfigServiceInstance } from './agentConfigService';
import { createAgentDefinitionService } from './agentDefinitionService';
import { createAgentConfigService } from './agentConfigService';
import { createPromptService, type PromptServiceInstance } from '../prompts/promptService';
import { createRepositories } from '../../../repositories/factory';
import { postgresDb } from '../../../connections/postgres/postgres';

/**
 * Legacy AgentServices interface for backward compatibility
 * @deprecated Use AgentDefinitionServiceInstance instead
 */
export interface AgentServices {
  promptService: PromptServiceInstance;
  agentConfigService: AgentConfigServiceInstance;
}

let instance: AgentDefinitionServiceInstance | null = null;
let legacyInstance: AgentServices | null = null;

/**
 * Get or create a singleton AgentDefinitionService for standalone use
 *
 * Uses production database connection.
 * Cached for the lifetime of the process.
 *
 * @returns AgentDefinitionServiceInstance
 *
 * @example
 * ```typescript
 * // In an API route:
 * const agentDefinitionService = await getAgentDefinitionService();
 * const definition = await agentDefinitionService.getDefinition(AGENTS.CHAT_GENERATE);
 * ```
 */
export async function getAgentDefinitionService(): Promise<AgentDefinitionServiceInstance> {
  if (!instance) {
    const repos = createRepositories(postgresDb);
    const promptService = createPromptService(repos);
    const agentConfigService = createAgentConfigService(repos);
    instance = createAgentDefinitionService(agentConfigService, promptService);
  }
  return instance;
}

/**
 * Reset the singleton instance
 * Useful for testing
 */
export function resetAgentDefinitionService(): void {
  instance = null;
  legacyInstance = null;
}

/**
 * Get or create a singleton AgentServices for standalone use (legacy pattern)
 *
 * @deprecated Use getAgentDefinitionService() instead
 *
 * Uses production database connection.
 * Cached for the lifetime of the process.
 *
 * @returns AgentServices (legacy interface)
 */
export async function getAgentServices(): Promise<AgentServices> {
  if (!legacyInstance) {
    const repos = createRepositories(postgresDb);
    const promptService = createPromptService(repos);
    const agentConfigService = createAgentConfigService(repos);
    legacyInstance = { promptService, agentConfigService };
  }
  return legacyInstance;
}

/**
 * Reset the legacy singleton instance
 * @deprecated
 */
export function resetAgentServices(): void {
  legacyInstance = null;
}
