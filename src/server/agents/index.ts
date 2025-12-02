// ==========================================
// Agent Factory Exports (NEW STANDARDIZED PATTERN)
// ==========================================
// Use these factory functions to create agents with dependency injection

// Base types and helpers
export { createAgentFromFunction, createRunnableAgent } from './base';
export type { Agent, AgentDeps, AgentConfig } from './base';

// Fitness Plan Agents
export { createFitnessPlanAgent } from './training/plans';

// Conversation Agents
export { type ChatAgentDeps } from './conversation/chain';

// Modification Agents (standalone agent)
export {
  createModificationsAgent,
  type ModificationsAgentDeps,
  type ModificationsAgentInput,
  type ModificationsResponse,
  createModificationTools,
  type WorkoutModificationService,
  type MicrocycleModificationService,
  type PlanModificationServiceInterface,
} from './modifications';

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
export * from './training/workouts/operations/generate';