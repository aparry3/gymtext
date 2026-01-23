/**
 * Exercise Resolution Types
 *
 * Types for the multi-tier exercise resolution system:
 * 1. Exact - normalized alias lookup (confidence: 1.0)
 * 2. Fuzzy - pg_trgm similarity (confidence: 0.4-0.9)
 * 3. Vector - pgvector cosine similarity (confidence: 0.2-0.7)
 * 4. Text - ILIKE substring match (confidence: 0.85)
 */

import type { Exercise } from './exercise';

export type ExerciseMatchMethod = 'exact' | 'fuzzy' | 'vector' | 'text';

export interface ExerciseSearchResult {
  exercise: Exercise;
  method: ExerciseMatchMethod;
  confidence: number;
  matchedOn: string;
}

export interface ExerciseResolutionResult extends ExerciseSearchResult {
  normalizedInput: string;
}

export interface ResolutionOptions {
  /** Create alias on fuzzy/vector match (default: true) */
  learnAlias?: boolean;
  /** Source for learned alias (default: inferred from method) */
  aliasSource?: string;
  /** Min fuzzy score (default: 0.3) */
  fuzzyThreshold?: number;
  /** Min vector score (default: 0.2) */
  semanticThreshold?: number;
  /** Max results for search (default: 10) */
  limit?: number;
}

export interface ExerciseResolutionServiceInstance {
  resolve(rawName: string, options?: ResolutionOptions): Promise<ExerciseResolutionResult | null>;
  search(query: string, options?: ResolutionOptions): Promise<ExerciseSearchResult[]>;
  generateEmbedding(text: string): Promise<number[]>;
  seedAllEmbeddings(): Promise<{ seeded: number; errors: number }>;
}
