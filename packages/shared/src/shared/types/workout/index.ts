/**
 * Centralized workout type exports
 *
 * All workout data uses the Blocks + Items schema.
 * See workoutDetails.ts for the canonical type definitions.
 */

// ============================================================================
// Workout Details — Blocks + Items Schema (CANONICAL)
// ============================================================================
export {
  type WorkoutDetails,
  type WorkoutItem,
  type WorkoutNestedItem,
  type WorkoutBlock,
  type WorkoutDetail,
  type WorkoutDetailType,
  type FeedbackField,
  type FeedbackFieldType,
  type FeedbackRow,
} from './workoutDetails';

// ============================================================================
// Formatted Text Schema (markdown workout format — separate concern)
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
