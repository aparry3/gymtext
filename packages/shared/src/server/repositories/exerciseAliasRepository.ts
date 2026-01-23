/**
 * Exercise Alias Repository
 *
 * Data access layer for exercise aliases.
 * Primary lookup method for resolving exercise names to canonical exercises.
 */

import { sql } from 'kysely';
import { BaseRepository } from '@/server/repositories/baseRepository';
import type {
  Exercise,
  ExerciseAlias,
  NewExerciseAlias,
} from '@/server/models/exercise';
import { normalizeForSearch, normalizeForLex } from '@/server/utils/exerciseNormalization';

export class ExerciseAliasRepository extends BaseRepository {
  /**
   * Create a new alias
   */
  async create(data: NewExerciseAlias): Promise<ExerciseAlias> {
    return await this.db
      .insertInto('exerciseAliases')
      .values({
        ...data,
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Create multiple aliases at once
   */
  async createMany(aliases: NewExerciseAlias[]): Promise<ExerciseAlias[]> {
    if (aliases.length === 0) {
      return [];
    }

    const values = aliases.map((alias) => ({
      ...alias,
      createdAt: new Date(),
    }));

    return await this.db
      .insertInto('exerciseAliases')
      .values(values)
      .returningAll()
      .execute();
  }

  /**
   * Find alias by normalized form (primary lookup method)
   * This is the main entry point for resolving exercise names
   */
  async findByNormalizedAlias(normalizedAlias: string): Promise<ExerciseAlias | undefined> {
    const searchable = normalizeForSearch(normalizedAlias);
    return await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where((eb) => eb.or([
        eb('aliasNormalized', '=', normalizedAlias),
        eb('aliasSearchable', '=', searchable),
      ]))
      .executeTakeFirst();
  }

  /**
   * Check if a normalized alias already exists
   */
  async exists(normalizedAlias: string): Promise<boolean> {
    const result = await this.db
      .selectFrom('exerciseAliases')
      .select('id')
      .where('aliasNormalized', '=', normalizedAlias)
      .executeTakeFirst();

    return result !== undefined;
  }

  /**
   * Find all aliases for a specific exercise
   */
  async findByExerciseId(exerciseId: string): Promise<ExerciseAlias[]> {
    return await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where('exerciseId', '=', exerciseId)
      .orderBy('createdAt', 'asc')
      .execute();
  }

  /**
   * Find alias by ID
   */
  async findById(id: string): Promise<ExerciseAlias | undefined> {
    return await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /**
   * Delete an alias by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('exerciseAliases')
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  /**
   * Delete all aliases for a specific exercise
   */
  async deleteByExerciseId(exerciseId: string): Promise<number> {
    const result = await this.db
      .deleteFrom('exerciseAliases')
      .where('exerciseId', '=', exerciseId)
      .executeTakeFirst();

    return Number(result.numDeletedRows);
  }

  /**
   * Count aliases for an exercise
   */
  async countByExerciseId(exerciseId: string): Promise<number> {
    const result = await this.db
      .selectFrom('exerciseAliases')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('exerciseId', '=', exerciseId)
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  /**
   * List aliases by source type
   */
  async listBySource(source: string, limit: number = 100): Promise<ExerciseAlias[]> {
    return await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where('source', '=', source)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();
  }

  /**
   * Search aliases by normalized text (ILIKE on alias_searchable column).
   * Returns deduplicated active exercises matching the query.
   */
  async searchByText(query: string, limit: number = 10): Promise<Exercise[]> {
    const normalized = normalizeForSearch(query);
    if (!normalized) return [];

    const like = `%${normalized}%`;

    const results = await this.db
      .selectFrom('exerciseAliases')
      .innerJoin('exercises', 'exercises.id', 'exerciseAliases.exerciseId')
      .selectAll('exercises')
      .where('exerciseAliases.aliasSearchable', 'ilike', like)
      .where('exercises.isActive', '=', true)
      .distinctOn('exercises.id')
      .limit(limit)
      .execute();

    return results as Exercise[];
  }

  /**
   * Find aliases by fuzzy similarity using pg_trgm
   * Returns aliases with similarity scores above threshold, ordered by similarity descending
   */
  async findByFuzzySimilarity(
    normalizedQuery: string,
    threshold: number = 0.6,
    limit: number = 10
  ): Promise<{ exerciseId: string; alias: string; aliasNormalized: string; score: number }[]> {
    const results = await sql<{
      exercise_id: string;
      alias: string;
      alias_normalized: string;
      similarity: number;
    }>`
      SELECT exercise_id, alias, alias_normalized, similarity(alias_normalized, ${normalizedQuery}) as similarity
      FROM exercise_aliases
      WHERE similarity(alias_normalized, ${normalizedQuery}) > ${threshold}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `.execute(this.db);

    return results.rows.map((row) => ({
      exerciseId: row.exercise_id,
      alias: row.alias,
      aliasNormalized: row.alias_normalized,
      score: Number(row.similarity),
    }));
  }

  /**
   * Find alias by exact match on alias_lex column
   */
  async findByExactLex(lexQuery: string): Promise<ExerciseAlias | undefined> {
    return await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where('aliasLex', '=', lexQuery)
      .executeTakeFirst();
  }

  /**
   * Find aliases by fuzzy similarity on alias_lex column using pg_trgm
   */
  async findByLexFuzzySimilarity(
    lexQuery: string,
    threshold: number = 0.3,
    limit: number = 50
  ): Promise<{ exerciseId: string; alias: string; aliasLex: string; score: number }[]> {
    const results = await sql<{
      exercise_id: string;
      alias: string;
      alias_lex: string;
      similarity: number;
    }>`
      SELECT exercise_id, alias, alias_lex, similarity(alias_lex, ${lexQuery}) as similarity
      FROM exercise_aliases
      WHERE similarity(alias_lex, ${lexQuery}) > ${threshold}
      ORDER BY similarity DESC
      LIMIT ${limit}
    `.execute(this.db);

    return results.rows.map((row) => ({
      exerciseId: row.exercise_id,
      alias: row.alias,
      aliasLex: row.alias_lex,
      score: Number(row.similarity),
    }));
  }
}
