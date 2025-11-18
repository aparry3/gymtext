// Generate operation
export {
  createDailyWorkoutAgent,
  type DailyWorkoutInput,
  type DailyWorkoutOutput,
} from './generate';

// Substitute operation
export {
  substituteExercises,
  type SubstituteExercisesContext,
  type Modification,
} from './substitute';

// Replace operation
export {
  replaceWorkout,
  type ReplaceWorkoutContext,
  type ReplaceWorkoutParams,
} from './replace';
