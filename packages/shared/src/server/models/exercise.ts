/**
 * Exercise Model Types
 *
 * Type definitions for canonical exercises and their aliases.
 * Used for exercise resolution and progress tracking.
 */

import type { Selectable, Insertable, Updateable } from 'kysely';
import type { Exercises, ExerciseAliases } from './_types';

// Base types from database
export type Exercise = Selectable<Exercises>;
export type NewExercise = Insertable<Exercises>;
export type ExerciseUpdate = Updateable<Exercises>;

export type ExerciseAlias = Selectable<ExerciseAliases>;
export type NewExerciseAlias = Insertable<ExerciseAliases>;
export type ExerciseAliasUpdate = Updateable<ExerciseAliases>;

/**
 * Source of how an alias was created/resolved
 * - seed: Initial data from exercises.json
 * - manual: Manually added by admin
 * - llm: Created from LLM resolution
 * - user: Created from user input
 * - fuzzy: Created from fuzzy matching
 * - vector: Created from vector similarity search
 */
export type AliasSource = 'seed' | 'manual' | 'llm' | 'user' | 'fuzzy' | 'vector';

/**
 * Exercise with all its aliases loaded
 */
export interface ExerciseWithAliases extends Exercise {
  exerciseAliases: ExerciseAlias[];
}
