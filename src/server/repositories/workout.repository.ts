import { BaseRepository } from './base.repository';
import { Workout } from '@/server/types';
import { JsonValue } from '@/shared/types/generated-schema';

export interface CreateWorkoutParams {
  userId: string;
  date: Date;
  workoutType: string;
  exercises?: JsonValue;
  sentAt?: Date | null;
}

export interface UpdateWorkoutParams {
  workoutType?: string;
  exercises?: JsonValue;
  sentAt?: Date | null;
}

export class WorkoutRepository extends BaseRepository {
  async create(params: CreateWorkoutParams): Promise<Workout> {
    const result = await this.db
      .insertInto('workouts')
      .values({
        userId: params.userId,
        date: params.date,
        workoutType: params.workoutType,
        exercises: params.exercises || [],
        sentAt: params.sentAt || null,
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  async findById(id: string): Promise<Workout | null> {
    const result = await this.db
      .selectFrom('workouts')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result || null;
  }

  async findByUserId(userId: string, limit?: number): Promise<Workout[]> {
    let query = this.db
      .selectFrom('workouts')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('date', 'desc');

    if (limit) {
      query = query.limit(limit);
    }

    return await query.execute();
  }

  async getRecentWorkouts(userId: string, limit: number = 5): Promise<Workout[]> {
    return await this.db
      .selectFrom('workouts')
      .where('userId', '=', userId)
      .orderBy('date', 'desc')
      .limit(limit)
      .selectAll()
      .execute();
  }

  async update(id: string, params: UpdateWorkoutParams): Promise<Workout | null> {
    const updateData: Record<string, unknown> = {};
    
    if (params.workoutType !== undefined) updateData.workoutType = params.workoutType;
    if (params.exercises !== undefined) updateData.exercises = params.exercises;
    if (params.sentAt !== undefined) updateData.sentAt = params.sentAt;

    const result = await this.db
      .updateTable('workouts')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result || null;
  }

  async delete(id: string): Promise<Workout | null> {
    const result = await this.db
      .deleteFrom('workouts')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result || null;
  }
}

// Re-export types for backward compatibility
export type { Workout } from '@/server/types';