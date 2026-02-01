/**
 * Exercise Resolution Types
 *
 * Types for the multi-tier exercise resolution system:
 * 1. Exact - normalized alias lookup (confidence: 1.0)
 * 2. Fuzzy - pg_trgm similarity (confidence: 0.4-0.9)
 * 3. Text - ILIKE substring match (confidence: 0.85)
 */

import type { Exercise } from './exercise';

export type ExerciseMatchMethod = 'exact' | 'exact_lex' | 'fuzzy' | 'fuzzy_lex' | 'text' | 'multi_signal';

export interface SignalScores {
  exactNorm: number;
  exactLex: number;
  trgramLex: number;
  trgramNorm: number;
  tokenOverlap: number;
  textMatch: number;
  intentPriority: number;
}

export interface ExerciseSearchResult {
  exercise: Exercise;
  method: ExerciseMatchMethod;
  confidence: number;
  matchedOn: string;
  scores?: SignalScores;
}

export interface ExerciseResolutionResult extends ExerciseSearchResult {
  normalizedInput: string;
}

export interface ResolutionOptions {
  /** Create alias on fuzzy match (default: true) */
  learnAlias?: boolean;
  /** Source for learned alias (default: inferred from method) */
  aliasSource?: string;
  /** Min confidence to learn alias (default: 0.7) */
  minLearnConfidence?: number;
  /** Min fuzzy score (default: 0.3) */
  fuzzyThreshold?: number;
  /** Max results for search (default: 10) */
  limit?: number;
}

export interface ExerciseResolutionServiceInstance {
  resolve(rawName: string, options?: ResolutionOptions): Promise<ExerciseResolutionResult | null>;
  search(query: string, options?: ResolutionOptions): Promise<ExerciseSearchResult[]>;
}
