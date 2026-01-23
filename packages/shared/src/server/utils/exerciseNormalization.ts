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

/**
 * Normalize a string for text search by stripping everything except lowercase a-z.
 * This mirrors the alias_searchable generated column in the database.
 *
 * @example
 * normalizeForSearch("Sit-Up") // "situp"
 * normalizeForSearch("Bench Press") // "benchpress"
 * normalizeForSearch("T-Bar Row (Landmine)") // "tbarrowlandmine"
 */
export function normalizeForSearch(input: string): string {
  return input.toLowerCase().replace(/[^a-z]/g, '');
}
