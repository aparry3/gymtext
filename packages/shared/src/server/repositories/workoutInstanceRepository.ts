/**
 * Workout Instance Repository
 *
 * Handles CRUD operations for workout_instances table.
 * Used to store outputs from workout:format and workout:structured agents.
 */
import { Kysely, sql } from 'kysely';
import { BaseRepository, type DatabaseInstance } from '@/server/repositories/baseRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import type { DB } from '@/server/models/_types';

export interface WorkoutInstanceRow {
  id: string;
  userId: string;
  date: Date;
  message: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWorkoutInstanceInput {
  userId: string;
  date: string; // YYYY-MM-DD format
  message?: string;
  details?: Record<string, unknown>;
}

export interface UpdateWorkoutInstanceInput {
  message?: string;
  details?: Record<string, unknown>;
}

export class WorkoutInstanceRepository extends BaseRepository {
  constructor(db: Kysely<DB> = postgresDb) {
    super(db);
  }

  /**
   * Upsert a workout instance by user_id + date
   */
  async upsert(input: CreateWorkoutInstanceInput & UpdateWorkoutInstanceInput): Promise<WorkoutInstanceRow> {
    const { userId, date, message, details } = input;

    // Use upsert with ON CONFLICT DO UPDATE
    const result = await this.db
      .insertInto('workoutInstances')
      .values({
        userId,
        date,
        message: message ?? null,
        details: details ? JSON.stringify(details) : null,
      })
      .onConflict((oc) => oc.columns(['userId', 'date']).doUpdateSet({
        message: message ?? null,
        details: details ? JSON.stringify(details) : null,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      }))
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: result.id,
      userId: result.userId,
      date: result.date,
      message: result.message,
      details: result.details as Record<string, unknown> | null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Get workout instance by user_id and date
   */
  async getByUserAndDate(userId: string, date: string): Promise<WorkoutInstanceRow | null> {
    const result = await this.db
      .selectFrom('workoutInstances')
      .selectAll()
      .where('userId', '=', userId)
      .where('date', '=', new Date(date))
      .executeTakeFirst();

    if (!result) return null;

    return {
      id: result.id,
      userId: result.userId,
      date: result.date,
      message: result.message,
      details: result.details as Record<string, unknown> | null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  /**
   * Get all workout instances for a user
   */
  async getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<WorkoutInstanceRow[]> {
    let query = this.db
      .selectFrom('workoutInstances')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('date', 'desc');

    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.offset(options.offset);
    }

    const results = await query.execute();

    return results.map((r) => ({
      id: r.id,
      userId: r.userId,
      date: r.date,
      message: r.message,
      details: r.details as Record<string, unknown> | null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  /**
   * Delete a workout instance
   */
  async delete(id: string): Promise<void> {
    await this.db
      .deleteFrom('workoutInstances')
      .where('id', '=', id)
      .execute();
  }
}

// Singleton instance for backward compatibility
let workoutInstanceRepository: WorkoutInstanceRepository | null = null;

export function getWorkoutInstanceRepository(db?: DatabaseInstance): WorkoutInstanceRepository {
  if (!workoutInstanceRepository) {
    workoutInstanceRepository = new WorkoutInstanceRepository(db as Kysely<DB>);
  }
  return workoutInstanceRepository;
}

// For dependency injection
export function createWorkoutInstanceRepository(db: Kysely<DB>): WorkoutInstanceRepository {
  return new WorkoutInstanceRepository(db);
}
