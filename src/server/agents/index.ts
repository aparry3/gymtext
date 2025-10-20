// ==========================================
// Agent Factory Exports (NEW STANDARDIZED PATTERN)
// ==========================================
// Use these factory functions to create agents with dependency injection

// Base types and helpers
export { createAgentFromFunction, createRunnableAgent } from './base';
export type { Agent, AgentDeps, AgentConfig } from './base';

// Fitness Plan Agents
export { createFitnessPlanAgent, type FitnessPlanAgentDeps } from './fitnessPlan/chain';

// Messaging Agents
export { createWorkoutMessageAgent, type WorkoutMessageAgentDeps } from './messaging/workoutMessage/chain';

// Conversation Agents
export { type ChatAgentDeps } from './conversation/chat/chain';

// Profile Agents
export { createProfileAgent, type ProfileAgentDeps, type PatchProfileCallback } from './profile/chain';

// Modification Agents (subagents of chat)
export { createModificationsAgent, type ModificationsAgentDeps } from './conversation/chat/modifications/chain';
export { createModificationTools, type WorkoutModificationService, type MicrocycleModificationService } from './conversation/chat/modifications/tools';

// ==========================================
// Legacy Exports (DEPRECATED - for backward compatibility only)
// ==========================================
// These will be removed in a future version
// Please migrate to the factory functions above

export * from './fitnessPlan/chain';
export * from './messaging/workoutMessage/chain';
export * from './messaging/welcomeMessage/chain';
export * from './messaging/planSummary/chain';
export * from './conversation/chat/chain';
export * from './conversation/reply/chain';
export * from './conversation/summary/chain';
export * from './fitnessPlan/microcyclePattern/chain';
export * from './fitnessPlan/workouts/generate/chain';