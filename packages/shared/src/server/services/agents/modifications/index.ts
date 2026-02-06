/**
 * Modification Agent Services Index
 *
 * Exports for modification sub-services and tools.
 * The orchestration layer is in orchestration/modificationService.ts.
 */

// Workout modification service (agent helper)
export { createWorkoutModificationService } from './workoutModificationService';
export type {
  WorkoutModificationServiceInstance,
  WorkoutModificationServiceDeps,
  ModifyWorkoutResult,
  ModifyWeekResult,
  ModifyWorkoutParams,
  ModifyWeekParams,
} from './workoutModificationService';

// Plan modification service (agent helper)
export { createPlanModificationService } from './planModificationService';
export type {
  PlanModificationServiceInstance,
  PlanModificationServiceDeps,
  ModifyPlanResult,
  ModifyPlanParams,
} from './planModificationService';

// Legacy modification tools (no longer used by modificationService - tools resolved via ToolRegistry)
// export { createModificationTools } from './tools';
// export type { ModificationToolContext, ModificationToolDeps } from './tools';
