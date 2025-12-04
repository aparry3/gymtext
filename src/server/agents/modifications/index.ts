// Types
export type { ModificationsAgentInput, ModificationsResponse, ModificationsAgentConfig } from './types';
export { ModificationsResponseSchema } from './types';

// Agent factory
export { createModificationsAgent } from './chain';

// Prompts
export { MODIFICATIONS_SYSTEM_PROMPT, buildModificationsUserMessage } from './prompts';

// Message sub-agent
export { createModificationMessageRunnable } from './message/chain';

// Note: Tools have been moved to @/server/services/agents/modifications/tools.ts
// Import tools from there instead of from this module
