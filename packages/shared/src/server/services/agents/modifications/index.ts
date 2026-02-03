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

// Modify week agent service (composed agent for week modifications with progressive delivery)
export { createModifyWeekAgentService, ModifyWeekAgentService } from './modifyWeekAgentService';
export type {
  ModifyWeekAgentServiceInstance,
  ModifyWeekOutput,
  ModifyWeekOptions,
} from './modifyWeekAgentService';

// Plan modification service (agent helper)
export { createPlanModificationService } from './planModificationService';
export type {
  PlanModificationServiceInstance,
  PlanModificationServiceDeps,
  ModifyPlanResult,
  ModifyPlanParams,
} from './planModificationService';

// Modification tools
export { createModificationTools } from './tools';
export type { ModificationToolContext, ModificationToolDeps } from './tools';
