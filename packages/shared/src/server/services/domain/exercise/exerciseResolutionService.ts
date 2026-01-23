/**
 * Exercise Resolution Service
 *
 * Multi-signal exercise resolution with weighted scoring.
 * Used by admin search and workout resolution.
 *
 * Signals:
 * 1. Exact norm (weight: 3.0) — Exact match on alias_normalized
 * 2. Exact lex (weight: 2.0) — Exact match on alias_lex
 * 3. Trigram lex (weight: 1.5) — pg_trgm similarity on alias_lex
 * 4. Trigram norm (weight: 1.0) — pg_trgm similarity on alias_normalized
 * 5. Token overlap (weight: 1.0) — Jaccard similarity on lex tokens
 */

import type { RepositoryContainer } from '@/server/repositories/factory';
import type {
  ExerciseSearchResult,
  ExerciseResolutionResult,
  ResolutionOptions,
  ExerciseResolutionServiceInstance,
  SignalScores,
} from '@/server/models/exerciseResolution';
import type { Exercise } from '@/server/models/exercise';
import { normalizeExerciseName, normalizeForLex } from '@/server/utils/exerciseNormalization';

export type { ExerciseResolutionServiceInstance } from '@/server/models/exerciseResolution';

const DEFAULT_FUZZY_THRESHOLD = 0.3;
const DEFAULT_LIMIT = 10;

// Signal weights for composite scoring
const W_EXACT_NORM = 3.0;
const W_EXACT_LEX = 2.0;
const W_TRGM_LEX = 1.5;
const W_TRGM_NORM = 1.0;
const W_TOKEN_OVERLAP = 1.0;
const MAX_SCORE = W_EXACT_NORM + W_EXACT_LEX + W_TRGM_LEX + W_TRGM_NORM + W_TOKEN_OVERLAP; // 8.5

type ExerciseMatchMethod = ExerciseSearchResult['method'];

/**
 * Compute Jaccard similarity between two lex token sets
 */
function tokenOverlap(queryLex: string, candidateLex: string): number {
  if (!queryLex || !candidateLex) return 0;
  const qTokens = new Set(queryLex.split(' '));
  const cTokens = new Set(candidateLex.split(' '));
  const intersection = [...qTokens].filter(t => cTokens.has(t)).length;
  const union = new Set([...qTokens, ...cTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Determine which signal contributed the highest weighted score
 */
function dominantMethod(scores: SignalScores): ExerciseMatchMethod {
  const weighted: [ExerciseMatchMethod, number][] = [
    ['exact', scores.exactNorm * W_EXACT_NORM],
    ['exact_lex', scores.exactLex * W_EXACT_LEX],
    ['fuzzy_lex', scores.trgramLex * W_TRGM_LEX],
    ['fuzzy', scores.trgramNorm * W_TRGM_NORM],
    ['multi_signal', scores.tokenOverlap * W_TOKEN_OVERLAP],
  ];
  weighted.sort((a, b) => b[1] - a[1]);
  return weighted[0][1] > 0 ? weighted[0][0] : 'multi_signal';
}

export function createExerciseResolutionService(
  repos: RepositoryContainer
): ExerciseResolutionServiceInstance {

  /**
   * Resolve a raw exercise name — short-circuits on exact matches,
   * falls back to multi-signal scoring.
   */
  async function resolve(
    rawName: string,
    options: ResolutionOptions = {}
  ): Promise<ExerciseResolutionResult | null> {
    const { learnAlias = true } = options;
    const normalizedInput = normalizeExerciseName(rawName);
    const lexInput = normalizeForLex(rawName);

    // Short-circuit: exact match on alias_normalized
    const exactAlias = await repos.exerciseAlias.findByNormalizedAlias(normalizedInput);
    if (exactAlias) {
      const exercise = await repos.exercise.findById(exactAlias.exerciseId);
      if (exercise && exercise.isActive) {
        return {
          exercise,
          method: 'exact',
          confidence: 1.0,
          matchedOn: exactAlias.alias,
          normalizedInput,
        };
      }
    }

    // Short-circuit: exact match on alias_lex
    const exactLex = await repos.exerciseAlias.findByExactLex(lexInput);
    if (exactLex) {
      const exercise = await repos.exercise.findById(exactLex.exerciseId);
      if (exercise && exercise.isActive) {
        return {
          exercise,
          method: 'exact_lex',
          confidence: 0.98,
          matchedOn: exactLex.alias,
          normalizedInput,
        };
      }
    }

    // Multi-signal scoring (limit=1)
    const results = await multiSignalSearch(rawName, normalizedInput, lexInput, { ...options, limit: 1 });
    if (results.length > 0) {
      const best = results[0];
      if (learnAlias) {
        await learnNewAlias(normalizedInput, rawName, best.exercise.id, options.aliasSource || best.method, best.confidence);
      }
      return {
        ...best,
        normalizedInput,
      };
    }

    return null;
  }

  /**
   * Search across all signals and return deduplicated results ranked by composite score
   */
  async function search(
    query: string,
    options: ResolutionOptions = {}
  ): Promise<ExerciseSearchResult[]> {
    const normalizedQuery = normalizeExerciseName(query);
    const lexQuery = normalizeForLex(query);
    return multiSignalSearch(query, normalizedQuery, lexQuery, options);
  }

  /**
   * Core multi-signal scoring implementation
   */
  async function multiSignalSearch(
    rawQuery: string,
    normalizedQuery: string,
    lexQuery: string,
    options: ResolutionOptions = {}
  ): Promise<ExerciseSearchResult[]> {
    const {
      fuzzyThreshold = DEFAULT_FUZZY_THRESHOLD,
      limit = DEFAULT_LIMIT,
    } = options;

    // Candidate accumulator: exerciseId → { exercise, scores, matchedOn }
    const candidates = new Map<string, {
      exercise: Exercise;
      scores: SignalScores;
      matchedOn: string;
    }>();

    function ensureCandidate(exercise: Exercise, matchedOn: string): SignalScores {
      if (!candidates.has(exercise.id)) {
        candidates.set(exercise.id, {
          exercise,
          scores: { exactNorm: 0, exactLex: 0, trgramLex: 0, trgramNorm: 0, tokenOverlap: 0 },
          matchedOn,
        });
      }
      return candidates.get(exercise.id)!.scores;
    }

    // Phase 1: Candidate Generation (parallel where possible)

    // 1a. Exact match on alias_normalized/alias_searchable
    const exactPromise = repos.exerciseAlias.findByNormalizedAlias(normalizedQuery);

    // 1b. Exact match on alias_lex
    const exactLexPromise = repos.exerciseAlias.findByExactLex(lexQuery);

    // 1c. Fuzzy on alias_normalized
    const fuzzyNormPromise = repos.exerciseAlias.findByFuzzySimilarity(
      normalizedQuery, fuzzyThreshold, 50
    );

    // 1d. Fuzzy on alias_lex
    const fuzzyLexPromise = repos.exerciseAlias.findByLexFuzzySimilarity(
      lexQuery, fuzzyThreshold, 50
    );

    const [exactAlias, exactLexAlias, fuzzyNormResults, fuzzyLexResults] =
      await Promise.all([exactPromise, exactLexPromise, fuzzyNormPromise, fuzzyLexPromise]);

    // Phase 2: Populate scores

    // Exact norm
    if (exactAlias) {
      const exercise = await repos.exercise.findById(exactAlias.exerciseId);
      if (exercise && exercise.isActive) {
        const scores = ensureCandidate(exercise, exactAlias.alias);
        scores.exactNorm = 1.0;
      }
    }

    // Exact lex
    if (exactLexAlias) {
      const exercise = await repos.exercise.findById(exactLexAlias.exerciseId);
      if (exercise && exercise.isActive) {
        const scores = ensureCandidate(exercise, exactLexAlias.alias);
        scores.exactLex = 1.0;
      }
    }

    // Fuzzy norm — deduplicate by exerciseId, keep best score
    const fuzzyNormByExercise = new Map<string, { alias: string; score: number }>();
    for (const f of fuzzyNormResults) {
      const existing = fuzzyNormByExercise.get(f.exerciseId);
      if (!existing || f.score > existing.score) {
        fuzzyNormByExercise.set(f.exerciseId, { alias: f.alias, score: f.score });
      }
    }
    for (const [exerciseId, { alias, score }] of fuzzyNormByExercise) {
      const exercise = await repos.exercise.findById(exerciseId);
      if (exercise && exercise.isActive) {
        const scores = ensureCandidate(exercise, alias);
        scores.trgramNorm = Math.max(scores.trgramNorm, score);
      }
    }

    // Fuzzy lex — deduplicate by exerciseId, keep best score
    const fuzzyLexByExercise = new Map<string, { alias: string; aliasLex: string; score: number }>();
    for (const f of fuzzyLexResults) {
      const existing = fuzzyLexByExercise.get(f.exerciseId);
      if (!existing || f.score > existing.score) {
        fuzzyLexByExercise.set(f.exerciseId, { alias: f.alias, aliasLex: f.aliasLex, score: f.score });
      }
    }
    for (const [exerciseId, { alias, aliasLex, score }] of fuzzyLexByExercise) {
      const exercise = await repos.exercise.findById(exerciseId);
      if (exercise && exercise.isActive) {
        const scores = ensureCandidate(exercise, alias);
        scores.trgramLex = Math.max(scores.trgramLex, score);
        // Also compute token overlap while we have the lex value
        scores.tokenOverlap = Math.max(scores.tokenOverlap, tokenOverlap(lexQuery, aliasLex));
      }
    }

    // For candidates that came in via exact or fuzzy_norm but not fuzzy_lex,
    // compute token overlap if we can get their aliasLex from the matchedOn
    for (const [, candidate] of candidates) {
      if (candidate.scores.tokenOverlap === 0) {
        // Use the exercise name as fallback for token overlap
        const candidateLex = normalizeForLex(candidate.matchedOn);
        candidate.scores.tokenOverlap = tokenOverlap(lexQuery, candidateLex);
      }
    }

    // Phase 3: Compute composite scores and rank
    const results: ExerciseSearchResult[] = [];
    for (const [, candidate] of candidates) {
      const { scores } = candidate;
      const rawScore =
        W_EXACT_NORM * scores.exactNorm +
        W_EXACT_LEX * scores.exactLex +
        W_TRGM_LEX * scores.trgramLex +
        W_TRGM_NORM * scores.trgramNorm +
        W_TOKEN_OVERLAP * scores.tokenOverlap;

      const confidence = rawScore / MAX_SCORE;
      const method = dominantMethod(scores);

      results.push({
        exercise: candidate.exercise,
        method,
        confidence,
        matchedOn: candidate.matchedOn,
        scores,
      });
    }

    console.log(`[ExerciseResolution] Multi-signal: ${candidates.size} candidates for "${rawQuery}" (limit: ${limit})`);

    return results
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  /**
   * Learn a new alias for an exercise (if it doesn't already exist)
   */
  async function learnNewAlias(
    normalizedAlias: string,
    rawAlias: string,
    exerciseId: string,
    source: string,
    confidence: number
  ): Promise<void> {
    const exists = await repos.exerciseAlias.exists(normalizedAlias);
    if (exists) return;

    await repos.exerciseAlias.create({
      exerciseId,
      alias: rawAlias,
      aliasNormalized: normalizedAlias,
      aliasLex: normalizeForLex(rawAlias),
      source,
      confidenceScore: confidence.toFixed(2),
    });
  }

  return {
    resolve,
    search,
  };
}
