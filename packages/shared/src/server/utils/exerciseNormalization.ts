/**
 * Exercise Name Normalization Utility
 *
 * Provides consistent normalization of exercise names for alias matching.
 * Used by:
 * - Migration seed to create normalized aliases
 * - ExerciseAliasRepository for lookups
 * - Resolution services for matching user input
 */

/**
 * Normalize an exercise name for consistent matching
 *
 * Transformations:
 * - Convert to lowercase
 * - Remove all punctuation except hyphens between words
 * - Collapse multiple spaces to single space
 * - Trim leading/trailing whitespace
 *
 * @example
 * normalizeExerciseName("Barbell Bench Press") // "barbell bench press"
 * normalizeExerciseName("3/4 Sit-Up") // "34 sit-up"
 * normalizeExerciseName("T-Bar Row (Landmine)") // "t-bar row landmine"
 */
export function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove punctuation except hyphens
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}
