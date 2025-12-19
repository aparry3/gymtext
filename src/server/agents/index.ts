// ==========================================
// Configurable Agent System (RECOMMENDED)
// ==========================================
// Use createAgent for declarative, composable agent definitions
export { createAgent } from './configurable';
export type {
  AgentDefinition,
  ModelConfig,
  ConfigurableAgent,
  SubAgentBatch,
  ModelId,
  InferSchemaOutput,
  AgentComposedOutput,
} from './configurable';

// ==========================================
// Agent Factory Exports
// ==========================================
// Use these factory functions to create agents with dependency injection

// Base types and helpers
export { createAgentFromFunction, createRunnableAgent } from './base';
export type { Agent, AgentDeps, AgentConfig } from './base';

// NOTE: Fitness Plan agents have been moved to @/server/services/agents/training/
// Use fitnessPlanAgentService.generateFitnessPlan() instead of createFitnessPlanAgent()

// NOTE: Messaging agents have been moved to @/server/services/agents/messaging/
// Use messagingAgentService methods instead of create*Agent() functions

// NOTE: Conversation agent has been moved to @/server/services/agents/chat/
// ChatService now handles chat agent creation inline

// NOTE: Modification agents have been moved to @/server/services/agents/modifications/
// Use ModificationService.makeModification() instead of createModificationsAgent()

// NOTE: Profile agents have been moved to @/server/services/agents/profile/
// Use ProfileService.updateProfile() or inline createAgent with prompts/schemas from there

// ==========================================
// Agent Exports
// ==========================================

export * from './training/plans';
export * from './training/microcycles';
export * from './training/workouts';