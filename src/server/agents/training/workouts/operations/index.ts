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
  updateWorkout,
  type UpdateWorkoutContext,
} from './update';
