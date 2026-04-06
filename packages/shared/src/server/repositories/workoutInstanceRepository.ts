/**
 * Workout Instance Repository
 *
 * Handles CRUD operations for workout_instances table.
 * Stores formatted workout messages per user per date.
 */
import { Kysely, sql } from 'kysely';
import { BaseRepository, type DatabaseInstance } from '@/server/repositories/baseRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import type { DB } from '@/server/models/_types';

export interface WorkoutInstanceRow {
  id: string;
  clientId: string;
  date: Date;
  message: string | null;
  createdAt: Date;
}

export interface CreateWorkoutInstanceInput {
  clientId: string;
  date: string; // YYYY-MM-DD format
  message?: string;
}

export interface UpdateWorkoutInstanceInput {
  message?: string;
}

export class WorkoutInstanceRepository extends BaseRepository {
  constructor(db: Kysely<DB> = postgresDb) {
    super(db);
  }

  /**
   * Upsert a workout instance by client_id + date
   */
  async upsert(input: CreateWorkoutInstanceInput & UpdateWorkoutInstanceInput): Promise<WorkoutInstanceRow> {
    const { clientId, date, message } = input;

    // Use upsert with ON CONFLICT DO UPDATE
    const result = await this.db
      .insertInto('workoutInstances')
      .values({
        clientId,
        date,
        message: message ?? null,
      })
      .onConflict((oc) => {
        const updateSet: Record<string, unknown> = {};
        if (message !== undefined) updateSet.message = message ?? null;
        return oc.columns(['clientId', 'date']).doUpdateSet(updateSet);
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return {
      id: result.id,
      clientId: result.clientId,
      date: result.date,
      message: result.message,
      createdAt: result.createdAt,
    };
  }

  /**
   * Get workout instance by ID
   */
  async getById(id: string): Promise<WorkoutInstanceRow | null> {
    const result = await this.db
      .selectFrom('workoutInstances')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!result) return null;

    return {
      id: result.id,
      clientId: result.clientId,
      date: result.date,
      message: result.message,
      createdAt: result.createdAt,
    };
  }

  /**
   * Get workout instance by client_id and date
   */
  async getByUserAndDate(clientId: string, date: string): Promise<WorkoutInstanceRow | null> {
    const result = await this.db
      .selectFrom('workoutInstances')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('date', '=', sql<Date>`${date}::date`)
      .executeTakeFirst();

    if (!result) return null;

    return {
      id: result.id,
      clientId: result.clientId,
      date: result.date,
      message: result.message,
      createdAt: result.createdAt,
    };
  }

  /**
   * Get all workout instances for a user
   */
  async getByUserId(clientId: string, options?: { limit?: number; offset?: number }): Promise<WorkoutInstanceRow[]> {
    let query = this.db
      .selectFrom('workoutInstances')
      .selectAll()
      .where('clientId', '=', clientId)
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
      clientId: r.clientId,
      date: r.date,
      message: r.message,
      createdAt: r.createdAt,
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
