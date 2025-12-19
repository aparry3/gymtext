// Step agents (for subAgent composition)
// These are used by WorkoutAgentService and chainRunnerService
export { createWorkoutMessageAgent } from './message';
export { createStructuredWorkoutAgent } from './structured';

// NOTE: Main operation functions (generateWorkout, modifyWorkout) have been moved to
// @/server/services/agents/training/workoutAgentService.ts
// Use workoutAgentService.generateWorkout() and workoutAgentService.modifyWorkout() instead
