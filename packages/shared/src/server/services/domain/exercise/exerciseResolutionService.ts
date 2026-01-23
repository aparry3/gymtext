/**
 * Exercise Resolution Service
 *
 * Multi-tier exercise resolution: exact → fuzzy → vector → text.
 * Used by admin search and workout resolution.
 *
 * Tiers:
 * 1. Exact (confidence: 1.0) — Normalized alias lookup
 * 2. Fuzzy (confidence: 0.4–0.9) — pg_trgm similarity on aliases
 * 3. Vector (confidence: 0.2–0.7) — pgvector cosine similarity on exercises
 * 4. Text (confidence: 0.85) — ILIKE substring match on exercise name
 */

import type { RepositoryContainer } from '@/server/repositories/factory';
import type {
  ExerciseSearchResult,
  ExerciseResolutionResult,
  ResolutionOptions,
  ExerciseResolutionServiceInstance,
} from '@/server/models/exerciseResolution';
import { normalizeExerciseName } from '@/server/utils/exerciseNormalization';
import { generateEmbedding, composeExerciseEmbeddingText } from '@/server/utils/embeddings';

export type { ExerciseResolutionServiceInstance } from '@/server/models/exerciseResolution';

const DEFAULT_FUZZY_THRESHOLD = 0.3;
const DEFAULT_SEMANTIC_THRESHOLD = 0.2;
const DEFAULT_LIMIT = 10;
const EMBEDDING_BATCH_SIZE = 20;

/**
 * Map a raw fuzzy score (0.3–1.0) to confidence range (0.4–0.9)
 */
function mapFuzzyConfidence(score: number): number {
  // Linear map from [0.3, 1.0] → [0.4, 0.9]
  return 0.4 + ((score - 0.3) / 0.7) * 0.5;
}

/**
 * Map a raw vector score (0.2–1.0) to confidence range (0.2–0.7)
 */
function mapVectorConfidence(score: number): number {
  // Linear map from [0.2, 1.0] → [0.2, 0.7]
  return 0.2 + ((score - 0.2) / 0.8) * 0.5;
}

export function createExerciseResolutionService(
  repos: RepositoryContainer
): ExerciseResolutionServiceInstance {

  /**
   * Resolve a raw exercise name through exact → fuzzy → vector tiers
   */
  async function resolve(
    rawName: string,
    options: ResolutionOptions = {}
  ): Promise<ExerciseResolutionResult | null> {
    const {
      learnAlias = true,
      fuzzyThreshold = DEFAULT_FUZZY_THRESHOLD,
      semanticThreshold = DEFAULT_SEMANTIC_THRESHOLD,
    } = options;

    const normalizedInput = normalizeExerciseName(rawName);

    // Tier 1: Exact alias lookup
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

    // Tier 2: Fuzzy similarity via pg_trgm
    const fuzzyResults = await repos.exerciseAlias.findByFuzzySimilarity(
      normalizedInput,
      fuzzyThreshold,
      1
    );

    if (fuzzyResults.length > 0) {
      const best = fuzzyResults[0];
      const exercise = await repos.exercise.findById(best.exerciseId);
      if (exercise && exercise.isActive) {
        const confidence = mapFuzzyConfidence(best.score);

        if (learnAlias) {
          await learnNewAlias(normalizedInput, rawName, exercise.id, options.aliasSource || 'fuzzy', confidence);
        }

        return {
          exercise,
          method: 'fuzzy',
          confidence,
          matchedOn: best.alias,
          normalizedInput,
        };
      }
    }

    // Tier 3: Vector similarity via pgvector
    try {
      const queryEmbedding = await generateEmbedding(rawName);
      const vectorResults = await repos.exercise.findByVectorSimilarity(queryEmbedding, 1);

      if (vectorResults.length > 0 && vectorResults[0].score >= semanticThreshold) {
        const best = vectorResults[0];
        const confidence = mapVectorConfidence(best.score);

        if (learnAlias) {
          await learnNewAlias(normalizedInput, rawName, best.exercise.id, options.aliasSource || 'vector', confidence);
        }

        return {
          exercise: best.exercise,
          method: 'vector',
          confidence,
          matchedOn: best.exercise.name,
          normalizedInput,
        };
      }
    } catch (error) {
      // Vector search failure is non-fatal - just means no vector result
      console.error('Vector search failed:', error);
    }

    return null;
  }

  /**
   * Search across all tiers and return deduplicated results sorted by confidence
   */
  async function search(
    query: string,
    options: ResolutionOptions = {}
  ): Promise<ExerciseSearchResult[]> {
    const {
      fuzzyThreshold = DEFAULT_FUZZY_THRESHOLD,
      semanticThreshold = DEFAULT_SEMANTIC_THRESHOLD,
      limit = DEFAULT_LIMIT,
    } = options;

    const normalizedQuery = normalizeExerciseName(query);
    const resultsMap = new Map<string, ExerciseSearchResult>();

    // Tier 1: Exact match
    const exactAlias = await repos.exerciseAlias.findByNormalizedAlias(normalizedQuery);
    if (exactAlias) {
      const exercise = await repos.exercise.findById(exactAlias.exerciseId);
      if (exercise && exercise.isActive) {
        resultsMap.set(exercise.id, {
          exercise,
          method: 'exact',
          confidence: 1.0,
          matchedOn: exactAlias.alias,
        });
      }
    }
    console.log(`[ExerciseResolution] Tier 1 (exact): ${resultsMap.size} results for "${query}"`);

    // Tier 2: Fuzzy matches
    const fuzzyResults = await repos.exerciseAlias.findByFuzzySimilarity(
      normalizedQuery,
      fuzzyThreshold,
      limit
    );

    for (const fuzzy of fuzzyResults) {
      if (resultsMap.has(fuzzy.exerciseId)) continue;
      const exercise = await repos.exercise.findById(fuzzy.exerciseId);
      if (exercise && exercise.isActive) {
        resultsMap.set(exercise.id, {
          exercise,
          method: 'fuzzy',
          confidence: mapFuzzyConfidence(fuzzy.score),
          matchedOn: fuzzy.alias,
        });
      }
    }
    console.log(`[ExerciseResolution] Tier 2 (fuzzy): ${fuzzyResults.length} raw matches, ${resultsMap.size} total results (threshold: ${fuzzyThreshold})`);

    // Tier 3: Vector matches
    try {
      const queryEmbedding = await generateEmbedding(query);
      const vectorResults = await repos.exercise.findByVectorSimilarity(queryEmbedding, limit);
      const vectorAdded = vectorResults.filter(v => v.score >= semanticThreshold && !resultsMap.has(v.exercise.id));

      for (const vec of vectorResults) {
        if (vec.score < semanticThreshold) continue;
        if (resultsMap.has(vec.exercise.id)) continue;
        resultsMap.set(vec.exercise.id, {
          exercise: vec.exercise,
          method: 'vector',
          confidence: mapVectorConfidence(vec.score),
          matchedOn: vec.exercise.name,
        });
      }
      console.log(`[ExerciseResolution] Tier 3 (vector): ${vectorAdded.length} new matches, ${resultsMap.size} total results (threshold: ${semanticThreshold}, top score: ${vectorResults[0]?.score?.toFixed(3) ?? 'n/a'})`);
    } catch (error) {
      console.error('[ExerciseResolution] Tier 3 (vector) failed:', error);
    }

    // Tier 4: Text (ILIKE) matches on alias_searchable column
    const textResults = await repos.exerciseAlias.searchByText(query, limit);
    let textAdded = 0;
    for (const exercise of textResults) {
      if (resultsMap.has(exercise.id)) continue;
      resultsMap.set(exercise.id, {
        exercise,
        method: 'text',
        confidence: 0.85,
        matchedOn: exercise.name,
      });
      textAdded++;
    }
    console.log(`[ExerciseResolution] Tier 4 (text): ${textResults.length} raw matches, ${textAdded} new, ${resultsMap.size} total results`);

    // Sort by confidence descending and limit
    return Array.from(resultsMap.values())
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
      source,
      confidenceScore: confidence.toFixed(2),
    });
  }

  /**
   * Seed embeddings for all active exercises that don't have one
   */
  async function seedAllEmbeddings(): Promise<{ seeded: number; errors: number }> {
    let seeded = 0;
    let errors = 0;

    let batch = await repos.exercise.listMissingEmbeddings(EMBEDDING_BATCH_SIZE);

    while (batch.length > 0) {
      for (const exercise of batch) {
        try {
          const text = composeExerciseEmbeddingText(exercise);
          const embedding = await generateEmbedding(text);
          await repos.exercise.updateEmbedding(exercise.id, embedding);
          seeded++;
        } catch (error) {
          console.error(`Failed to seed embedding for "${exercise.name}":`, error);
          errors++;
        }
      }

      batch = await repos.exercise.listMissingEmbeddings(EMBEDDING_BATCH_SIZE);
    }

    return { seeded, errors };
  }

  return {
    resolve,
    search,
    generateEmbedding,
    seedAllEmbeddings,
  };
}
