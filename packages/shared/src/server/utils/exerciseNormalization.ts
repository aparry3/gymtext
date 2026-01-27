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
 * Normalize a string for text search by stripping everything except lowercase a-z
 * and digits 0-9. This mirrors the alias_searchable generated column in the database.
 *
 * @example
 * normalizeForSearch("3/4 Sit-Up") // "34situp"
 * normalizeForSearch("Bench Press") // "benchpress"
 * normalizeForSearch("T-Bar Row (Landmine)") // "tbarrowlandmine"
 */
export function normalizeForSearch(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Synonym map for common exercise name variations.
 * Keys are normalized (lowercase) tokens; values are the canonical replacement(s).
 */
const EXERCISE_SYNONYM_MAP: Record<string, string> = {
  laying: 'lying',
  dumbell: 'dumbbell',
  dumbel: 'dumbbell',
  dumble: 'dumbbell',
  db: 'dumbbell',
  bb: 'barbell',
  rdl: 'romanian deadlift',
  pullup: 'pull up',
  pushup: 'push up',
  situp: 'sit up',
  chinup: 'chin up',
  stepup: 'step up',
  incl: 'incline',
  decl: 'decline',
  ext: 'extension',
  tri: 'tricep',
  bi: 'bicep',
};

/**
 * Stopwords to remove from exercise names during lex normalization.
 */
const STOPWORDS = new Set([
  'with', 'and', 'the', 'a', 'an', 'of', 'on', 'to',
  'for', 'in', 'using', 'from', 'by',
]);

/**
 * Irregular singular forms that don't follow standard rules.
 */
const IRREGULAR_SINGULARS: Record<string, string> = {
  calves: 'calf',
};

/**
 * Simple singularization for exercise-related terms.
 * Handles common English plural patterns.
 */
function singularize(word: string): string {
  if (IRREGULAR_SINGULARS[word]) return IRREGULAR_SINGULARS[word];
  if (word.length <= 2) return word;

  if (word.endsWith('sses')) return word.slice(0, -2); // presses → press... wait no, "sses" → "ss"
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y'; // flies → fly
  if (word.endsWith('ses') && !word.endsWith('sses')) return word.slice(0, -1); // raises → raise
  if (word.endsWith('s') && !word.endsWith('ss') && !word.endsWith('us')) return word.slice(0, -1);

  return word;
}

/**
 * Normalize an exercise name to a lexical representation for improved matching.
 *
 * Produces a token-based, order-invariant string with:
 * - Synonym expansion (db → dumbbell, rdl → romanian deadlift, etc.)
 * - Singularization (curls → curl, presses → press)
 * - Stopword removal (with, and, the, etc.)
 * - Alphabetical token sorting
 *
 * @example
 * normalizeForLex("Laying Leg Curls") // "curl leg lying"
 * normalizeForLex("Dumbell Bench Press") // "bench dumbbell press"
 * normalizeForLex("RDL") // "deadlift romanian"
 * normalizeForLex("DB Bench Press") // "bench dumbbell press"
 * normalizeForLex("3/4 Sit-Up") // "sit up"
 */
export function normalizeForLex(input: string): string {
  // 1. Lowercase
  let text = input.toLowerCase();
  // 2. Replace hyphens with spaces
  text = text.replace(/-/g, ' ');
  // 3. Strip non-alpha chars (including digits)
  text = text.replace(/[^a-z\s]/g, '');
  // 4. Tokenize on whitespace
  let tokens = text.split(/\s+/).filter(t => t.length > 0);
  // 5. Remove stopwords
  tokens = tokens.filter(t => !STOPWORDS.has(t));
  // 6. Singularize each token
  tokens = tokens.map(singularize);
  // 7. Apply synonym map (supports multi-word expansion)
  tokens = tokens.flatMap(t => {
    const replacement = EXERCISE_SYNONYM_MAP[t];
    if (replacement) return replacement.split(' ');
    return [t];
  });
  // 8. Deduplicate tokens
  tokens = [...new Set(tokens)];
  // 9. Sort alphabetically
  tokens.sort();
  // 10. Join with spaces
  return tokens.join(' ');
}
