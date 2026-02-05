/**
 * Agent Configuration Services
 *
 * - AgentConfigService: CRUD for agent_configs table
 * - AgentDefinitionService: Fetches full definitions (prompts + model config)
 * - Standalone helpers: For API routes that don't use the full service factory
 */

export { createAgentConfigService } from './agentConfigService';
export type { AgentConfigServiceInstance } from './agentConfigService';

export { createAgentDefinitionService } from './agentDefinitionService';
export type {
  AgentDefinitionServiceInstance,
  AgentDefinition,
  GetDefinitionOptions,
} from './agentDefinitionService';

// Standalone helpers for API routes
export {
  getAgentDefinitionService,
  resetAgentDefinitionService,
  getAgentServices,
  resetAgentServices,
} from './standalone';
export type { AgentServices as StandaloneAgentServices } from './standalone';
