/**
 * Centralized workout type exports
 */

// ============================================================================
// Formatted Text Schema (markdown workout format)
// ============================================================================
export {
  FormattedWorkoutSchema,
  EnhancedFormattedWorkoutSchema,
  UpdatedFormattedWorkoutSchema,
  type FormattedWorkout,
  type EnhancedFormattedWorkout,
  type UpdatedFormattedWorkout,
} from './formattedSchema';

// ============================================================================
// Workout Tags
// ============================================================================
export {
  WorkoutCategoryTag,
  WorkoutSplitTag,
  WorkoutMuscleTag,
  WorkoutPatternTag,
  WorkoutEquipmentTag,
  WorkoutTagsSchema,
  flattenWorkoutTags,
  type WorkoutTags,
} from './tags';

// ============================================================================
// Session Types
// ============================================================================
export {
  SESSION_TYPE_MAP,
  DB_SESSION_TYPES,
  LLM_SESSION_TYPES,
  mapSessionType,
  isValidDBSessionType,
  type DBSessionType,
  type LLMSessionType,
} from './sessionTypes';
