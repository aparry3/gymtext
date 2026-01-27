import { BaseRepository } from '@/server/repositories/baseRepository';
import type { Json } from '../models/_types';

/**
 * Types for user exercise metrics
 */
export interface UserExerciseMetric {
  id: string;
  clientId: string;
  workoutId: string;
  exerciseId: string;
  data: ExerciseMetricData;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUserExerciseMetric {
  clientId: string;
  workoutId: string;
  exerciseId: string;
  data: ExerciseMetricData;
}

/**
 * UserExerciseMetric with joined exercise data
 */
export interface UserExerciseMetricWithExercise extends UserExerciseMetric {
  exerciseName: string;
}

/**
 * The data stored in the JSONB column
 */
export type ExerciseMetricData = StrengthMetricData | CardioMetricData | MobilityMetricData;

export interface StrengthMetricData {
  type: 'strength';
  sets: StrengthSetData[];
}

export interface StrengthSetData {
  setNumber: number;
  weight: number | null;
  weightUnit: 'lbs' | 'kg';
  reps: number | null;
  completed: boolean;
}

export interface CardioMetricData {
  type: 'cardio';
  durationSeconds: number | null;
  distanceMeters: number | null;
  distanceUnit?: 'km' | 'mi';
  completed: boolean;
}

export interface MobilityMetricData {
  type: 'mobility';
  durationSeconds: number | null;
  completed: boolean;
}

/**
 * Repository for user exercise metrics (workout tracking data)
 */
export class ExerciseMetricsRepository extends BaseRepository {
  /**
   * Upsert a metric - insert or update by (workout_id, exercise_id)
   */
  async upsert(metric: NewUserExerciseMetric): Promise<UserExerciseMetric> {
    const result = await this.db
      .insertInto('userExerciseMetrics')
      .values({
        clientId: metric.clientId,
        workoutId: metric.workoutId,
        exerciseId: metric.exerciseId,
        data: JSON.stringify(metric.data) as unknown as Json,
      })
      .onConflict((oc) =>
        oc.columns(['workoutId', 'exerciseId']).doUpdateSet({
          data: JSON.stringify(metric.data) as unknown as Json,
          updatedAt: new Date(),
        })
      )
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.mapToUserExerciseMetric(result);
  }

  /**
   * Get all metrics for a workout
   */
  async getByWorkoutId(workoutId: string): Promise<UserExerciseMetric[]> {
    const results = await this.db
      .selectFrom('userExerciseMetrics')
      .where('workoutId', '=', workoutId)
      .selectAll()
      .execute();

    return results.map((r) => this.mapToUserExerciseMetric(r));
  }

  /**
   * Get a specific metric by workout and exercise
   */
  async getByWorkoutAndExercise(
    workoutId: string,
    exerciseId: string
  ): Promise<UserExerciseMetric | undefined> {
    const result = await this.db
      .selectFrom('userExerciseMetrics')
      .where('workoutId', '=', workoutId)
      .where('exerciseId', '=', exerciseId)
      .selectAll()
      .executeTakeFirst();

    return result ? this.mapToUserExerciseMetric(result) : undefined;
  }

  /**
   * Get all metrics for a user (for history/analytics)
   */
  async getByClientId(
    clientId: string,
    limit: number = 100
  ): Promise<UserExerciseMetric[]> {
    const results = await this.db
      .selectFrom('userExerciseMetrics')
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return results.map((r) => this.mapToUserExerciseMetric(r));
  }

  /**
   * Get metrics for a specific exercise across workouts (for progression tracking)
   */
  async getByExerciseId(
    clientId: string,
    exerciseId: string,
    limit: number = 20
  ): Promise<UserExerciseMetric[]> {
    const results = await this.db
      .selectFrom('userExerciseMetrics')
      .where('clientId', '=', clientId)
      .where('exerciseId', '=', exerciseId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return results.map((r) => this.mapToUserExerciseMetric(r));
  }

  /**
   * Get metrics for all exercises that share a movement (e.g., all bench press variations)
   * Joins through exercises table to filter by movement_id
   */
  async getByMovementId(
    clientId: string,
    movementId: string,
    limit: number = 50
  ): Promise<UserExerciseMetricWithExercise[]> {
    const results = await this.db
      .selectFrom('userExerciseMetrics')
      .innerJoin('exercises', 'userExerciseMetrics.exerciseId', 'exercises.id')
      .where('userExerciseMetrics.clientId', '=', clientId)
      .where('exercises.movementId', '=', movementId)
      .orderBy('userExerciseMetrics.createdAt', 'desc')
      .limit(limit)
      .select([
        'userExerciseMetrics.id',
        'userExerciseMetrics.clientId',
        'userExerciseMetrics.workoutId',
        'userExerciseMetrics.exerciseId',
        'userExerciseMetrics.data',
        'userExerciseMetrics.createdAt',
        'userExerciseMetrics.updatedAt',
        'exercises.name as exerciseName',
      ])
      .execute();

    return results.map((r) => ({
      ...this.mapToUserExerciseMetric(r),
      exerciseName: r.exerciseName,
    }));
  }

  /**
   * Delete a metric
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('userExerciseMetrics')
      .where('id', '=', id)
      .executeTakeFirst();

    return Number(result.numDeletedRows) > 0;
  }

  /**
   * Map database row to UserExerciseMetric
   */
  private mapToUserExerciseMetric(row: {
    id: string;
    clientId: string;
    workoutId: string;
    exerciseId: string;
    data: Json;
    createdAt: Date;
    updatedAt: Date;
  }): UserExerciseMetric {
    return {
      id: row.id,
      clientId: row.clientId,
      workoutId: row.workoutId,
      exerciseId: row.exerciseId,
      data: (typeof row.data === 'string' ? JSON.parse(row.data) : row.data) as ExerciseMetricData,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
