// Generate operation
export {
  createDailyWorkoutAgent,
  type DailyWorkoutInput,
  type DailyWorkoutOutput,
  type DailyWorkoutContext,
  type GeneratedWorkoutResult,
} from './generate';

// Substitute operation
export {
  substituteExercises,
  type SubstitutedWorkoutResult,
  type SubstituteExercisesContext,
  type Modification,
} from './substitute';

// Replace operation
export {
  replaceWorkout,
  type ReplacedWorkoutResult,
  type ReplaceWorkoutContext,
  type ReplaceWorkoutParams,
} from './replace';
