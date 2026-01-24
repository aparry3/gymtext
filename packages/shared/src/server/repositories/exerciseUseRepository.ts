/**
 * Exercise Use Repository
 *
 * Tracks exercise usage for popularity scoring.
 * Also provides recomputation of popularity based on accumulated usage data.
 */

import { sql } from 'kysely';
import { BaseRepository } from '@/server/repositories/baseRepository';
import type { ExerciseUse, ExerciseUseType } from '@/server/models/exercise';

export class ExerciseUseRepository extends BaseRepository {
  /**
   * Track a single exercise use event
   */
  async trackUse(
    exerciseId: string,
    userId: string | null,
    useType: ExerciseUseType
  ): Promise<ExerciseUse> {
    return await this.db
      .insertInto('exerciseUses')
      .values({
        exerciseId,
        userId,
        useType,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Recompute popularity for all exercises based on usage counts.
   * Uses log-normalized scoring: log(count + 1) / log(maxCount + 1) → 0-1 range.
   * Exercises with no uses get 0.5 (neutral).
   */
  async recomputePopularity(windowDays?: number): Promise<number> {
    // Count uses per exercise, optionally windowed
    const windowClause = windowDays
      ? sql`WHERE eu.created_at > NOW() - INTERVAL '${sql.raw(String(windowDays))} days'`
      : sql``;

    // Get max count for normalization
    const maxResult = await sql<{ max_count: number }>`
      SELECT COALESCE(MAX(cnt), 0) as max_count FROM (
        SELECT COUNT(*) as cnt
        FROM exercise_uses eu
        ${windowClause}
        GROUP BY eu.exercise_id
      ) sub
    `.execute(this.db);

    const maxCount = Number(maxResult.rows[0]?.max_count || 0);

    if (maxCount === 0) {
      // No uses at all — reset everything to 0.5
      const result = await this.db
        .updateTable('exercises')
        .set({ popularity: '0.500' })
        .executeTakeFirst();
      return Number(result.numUpdatedRows);
    }

    // Update popularity using log normalization
    const logMax = Math.log(maxCount + 1);

    await sql`
      UPDATE exercises e
      SET popularity = CASE
        WHEN sub.cnt IS NULL THEN 0.500
        ELSE ROUND(CAST(LN(sub.cnt + 1) / ${logMax} AS numeric), 3)
      END
      FROM (
        SELECT exercise_id, COUNT(*) as cnt
        FROM exercise_uses eu
        ${windowClause}
        GROUP BY exercise_id
      ) sub
      WHERE e.id = sub.exercise_id
    `.execute(this.db);

    // Set exercises with no uses to neutral
    await sql`
      UPDATE exercises
      SET popularity = 0.500
      WHERE id NOT IN (
        SELECT DISTINCT exercise_id FROM exercise_uses eu ${windowClause}
      )
    `.execute(this.db);

    return maxCount;
  }
}
