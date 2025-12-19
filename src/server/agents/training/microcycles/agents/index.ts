// Step agents (for subAgent composition)
// These are used by MicrocycleAgentService and chainRunnerService
export { createMicrocycleMessageAgent, type MicrocycleMessageConfig } from './message';
export { createStructuredMicrocycleAgent, type StructuredMicrocycleConfig } from './structured';

// NOTE: Main operation functions (generateMicrocycle, modifyMicrocycle) have been moved to
// @/server/services/agents/training/microcycleAgentService.ts
// Use microcycleAgentService.generateMicrocycle() and microcycleAgentService.modifyMicrocycle() instead
