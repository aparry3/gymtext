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
// Agent Factory Exports (LEGACY PATTERN)
// ==========================================
// Use these factory functions to create agents with dependency injection

// Base types and helpers
export { createAgentFromFunction, createRunnableAgent } from './base';
export type { Agent, AgentDeps, AgentConfig } from './base';

// Fitness Plan Agents
export { createFitnessPlanAgent } from './training/plans';

// Conversation Agents
export { type ChatAgentConfig } from './conversation/chain';

// Image Generation Agents
export {
  createExerciseImageAgent,
  type ExerciseImageInput,
  type ExerciseImageOutput,
  type ExerciseImageConfig,
} from './images/exercises';

// Modification Agents (standalone agent)
export {
  createModificationsAgent,
  type ModificationsAgentConfig,
  type ModificationsAgentInput,
  type ModificationsResponse,
} from './modifications';

// Note: Modification tools have been moved to @/server/services/agents/modifications/tools.ts
// Import createModificationTools and related types from there instead

// ==========================================
// Legacy Exports (DEPRECATED - for backward compatibility only)
// ==========================================
// These will be removed in a future version
// Please migrate to the factory functions above

export * from './training/plans';
export * from './messaging/welcomeMessage/chain';
export * from './messaging/planSummary/chain';
export * from './messaging/planMicrocycleCombined/chain';
export * from './messaging/updatedMicrocycleMessage/chain';
export * from './conversation/chain';
export * from './training/microcycles';
export * from './training/workouts';