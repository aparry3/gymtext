// Step agents (for subAgent composition)
// These are used by FitnessPlanAgentService and chainRunnerService
export { createFitnessPlanMessageAgent, type FitnessPlanMessageConfig } from './message';
export { createStructuredPlanAgent, type StructuredPlanConfig } from './structured';

// NOTE: Main operation functions (generateFitnessPlan, modifyFitnessPlan) have been moved to
// @/server/services/agents/training/fitnessPlanAgentService.ts
// Use fitnessPlanAgentService.generateFitnessPlan() instead
