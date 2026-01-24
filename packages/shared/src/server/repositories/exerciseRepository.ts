/**
 * Exercise Repository
 *
 * Data access layer for canonical exercises.
 * Handles CRUD operations and search functionality.
 */

import { sql } from 'kysely';
import { BaseRepository } from '@/server/repositories/baseRepository';
import type {
  Exercise,
  NewExercise,
  ExerciseUpdate,
  ExerciseWithAliases,
} from '@/server/models/exercise';

export class ExerciseRepository extends BaseRepository {
  /**
   * Create a new exercise
   */
  async create(data: NewExercise): Promise<Exercise> {
    return await this.db
      .insertInto('exercises')
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Find exercise by ID
   */
  async findById(id: string): Promise<Exercise | undefined> {
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /**
   * Find exercise by exact canonical name
   */
  async findByName(name: string): Promise<Exercise | undefined> {
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where('name', '=', name)
      .executeTakeFirst();
  }

  /**
   * Search exercises by name (case-insensitive partial match)
   */
  async search(query: string, limit: number = 20): Promise<Exercise[]> {
    const like = `%${query}%`;
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where('name', 'ilike', like)
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .limit(limit)
      .execute();
  }

  /**
   * Find exercise with all its aliases
   */
  async findWithAliases(id: string): Promise<ExerciseWithAliases | undefined> {
    const exercise = await this.findById(id);
    if (!exercise) {
      return undefined;
    }

    const aliases = await this.db
      .selectFrom('exerciseAliases')
      .selectAll()
      .where('exerciseId', '=', id)
      .execute();

    return {
      ...exercise,
      exerciseAliases: aliases,
    };
  }

  /**
   * List all active exercises with pagination
   */
  async listActive(offset: number = 0, limit: number = 50): Promise<Exercise[]> {
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .offset(offset)
      .limit(limit)
      .execute();
  }

  /**
   * List exercises by category
   */
  async listByCategory(category: string, limit: number = 50): Promise<Exercise[]> {
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where('category', '=', category)
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .limit(limit)
      .execute();
  }

  /**
   * List exercises by primary muscle group
   */
  async listByMuscle(muscle: string, limit: number = 50): Promise<Exercise[]> {
    return await this.db
      .selectFrom('exercises')
      .selectAll()
      .where((eb) =>
        eb(sql`primary_muscles @> ARRAY[${muscle}]::text[]`, '=', sql`true`)
      )
      .where('isActive', '=', true)
      .orderBy('name', 'asc')
      .limit(limit)
      .execute();
  }

  /**
   * Update an exercise
   */
  async update(id: string, data: ExerciseUpdate): Promise<Exercise | undefined> {
    return await this.db
      .updateTable('exercises')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Soft delete (deactivate) an exercise
   */
  async deactivate(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable('exercises')
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numUpdatedRows) > 0;
  }

  /**
   * Count total active exercises
   */
  async countActive(): Promise<number> {
    const result = await this.db
      .selectFrom('exercises')
      .select((eb) => eb.fn.countAll<number>().as('count'))
      .where('isActive', '=', true)
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  /**
   * Get all unique categories
   */
  async getCategories(): Promise<string[]> {
    const results = await this.db
      .selectFrom('exercises')
      .select('category')
      .where('isActive', '=', true)
      .distinct()
      .orderBy('category', 'asc')
      .execute();

    return results.map((r) => r.category);
  }

  /**
   * Get all unique equipment types
   */
  async getEquipmentTypes(): Promise<string[]> {
    const results = await this.db
      .selectFrom('exercises')
      .select('equipment')
      .where('isActive', '=', true)
      .where('equipment', 'is not', null)
      .distinct()
      .orderBy('equipment', 'asc')
      .execute();

    return results.map((r) => r.equipment).filter((e): e is string => e !== null);
  }

  /**
   * Update the embedding vector for an exercise
   */
  async updateEmbedding(id: string, embedding: number[]): Promise<void> {
    const vectorStr = `[${embedding.join(',')}]`;
    await sql`UPDATE exercises SET embedding = ${vectorStr}::vector WHERE id = ${id}`.execute(this.db);
  }

  /**
   * Find exercises by vector cosine similarity
   * Returns exercises with similarity score (1 - cosine distance)
   */
  async findByVectorSimilarity(
    embedding: number[],
    limit: number = 10
  ): Promise<{ exercise: Exercise; score: number }[]> {
    const vectorStr = `[${embedding.join(',')}]`;
    const results = await sql<Exercise & { similarity: number }>`
      SELECT *, 1 - (embedding <=> ${vectorStr}::vector) as similarity
      FROM exercises
      WHERE embedding IS NOT NULL AND is_active = true
      ORDER BY embedding <=> ${vectorStr}::vector
      LIMIT ${limit}
    `.execute(this.db);

    return results.rows.map((row) => ({
      exercise: row,
      score: Number(row.similarity),
    }));
  }

  /**
   * List active exercises with popularity at or above a threshold
   */
  async listActiveAbovePopularity(threshold: number): Promise<Pick<Exercise, 'id' | 'name' | 'description' | 'popularity'>[]> {
    return await this.db
      .selectFrom('exercises')
      .select(['id', 'name', 'description', 'popularity'])
      .where('isActive', '=', true)
      .where('popularity', '>=', String(threshold))
      .orderBy('name', 'asc')
      .execute();
  }

  /**
   * Adjust an exercise's popularity by a delta, clamped to [0, 1]
   */
  async adjustPopularity(id: string, delta: number): Promise<{ id: string; popularity: string } | undefined> {
    return await this.db
      .updateTable('exercises')
      .set(() => ({
        popularity: sql`LEAST(1.000, GREATEST(0.000, CAST(popularity + ${delta} AS NUMERIC(4,3))))`,
      }))
      .where('id', '=', id)
      .returning(['id', 'popularity'])
      .executeTakeFirst();
  }

  /**
   * Reset all exercises' popularity to 0
   */
  async resetAllPopularity(): Promise<number> {
    const result = await this.db
      .updateTable('exercises')
      .set({ popularity: '0.000' })
      .where('isActive', '=', true)
      .executeTakeFirst();
    return Number(result.numUpdatedRows);
  }

  /**
   * List all active exercises that are missing embeddings
   */
  async listMissingEmbeddings(limit: number = 100): Promise<Exercise[]> {
    return await sql<Exercise>`
      SELECT * FROM exercises
      WHERE embedding IS NULL AND is_active = true
      ORDER BY name ASC
      LIMIT ${limit}
    `.execute(this.db).then(r => r.rows);
  }
}
