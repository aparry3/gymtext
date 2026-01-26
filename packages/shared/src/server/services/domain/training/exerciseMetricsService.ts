import type { RepositoryContainer } from '../../../repositories/factory';
import type {
  UserExerciseMetric,
  UserExerciseMetricWithExercise,
  ExerciseMetricData,
} from '../../../repositories/exerciseMetricsRepository';

/**
 * ExerciseMetricsServiceInstance interface
 *
 * Handles saving and retrieving exercise performance data during workouts.
 */
export interface ExerciseMetricsServiceInstance {
  /**
   * Save progress for a single exercise in a workout
   * Upserts by (workoutId, exerciseId)
   */
  saveExerciseProgress(
    clientId: string,
    workoutId: string,
    exerciseId: string,
    data: ExerciseMetricData
  ): Promise<UserExerciseMetric>;

  /**
   * Get all metrics for a workout
   * Returns a map of exerciseId -> metric data for easy lookup
   */
  getWorkoutMetrics(workoutId: string): Promise<Record<string, ExerciseMetricData>>;

  /**
   * Get raw metric records for a workout
   */
  getWorkoutMetricRecords(workoutId: string): Promise<UserExerciseMetric[]>;

  /**
   * Get historical metrics for a specific exercise (for progression tracking)
   */
  getExerciseHistory(
    clientId: string,
    exerciseId: string,
    limit?: number
  ): Promise<UserExerciseMetric[]>;

  /**
   * Get the most recent metric for an exercise (for "previous" display)
   */
  getLastMetricForExercise(
    clientId: string,
    exerciseId: string
  ): Promise<UserExerciseMetric | undefined>;

  /**
   * Get historical metrics for all exercises that share a movement
   * (e.g., "show me my bench press history" across all bench variations)
   */
  getMovementHistory(
    clientId: string,
    movementId: string,
    limit?: number
  ): Promise<UserExerciseMetricWithExercise[]>;
}

/**
 * Create an ExerciseMetricsService instance
 */
export function createExerciseMetricsService(
  repos: RepositoryContainer
): ExerciseMetricsServiceInstance {
  return {
    async saveExerciseProgress(
      clientId: string,
      workoutId: string,
      exerciseId: string,
      data: ExerciseMetricData
    ): Promise<UserExerciseMetric> {
      return await repos.exerciseMetrics.upsert({
        clientId,
        workoutId,
        exerciseId,
        data,
      });
    },

    async getWorkoutMetrics(workoutId: string): Promise<Record<string, ExerciseMetricData>> {
      const metrics = await repos.exerciseMetrics.getByWorkoutId(workoutId);

      const result: Record<string, ExerciseMetricData> = {};
      for (const metric of metrics) {
        result[metric.exerciseId] = metric.data;
      }

      return result;
    },

    async getWorkoutMetricRecords(workoutId: string): Promise<UserExerciseMetric[]> {
      return await repos.exerciseMetrics.getByWorkoutId(workoutId);
    },

    async getExerciseHistory(
      clientId: string,
      exerciseId: string,
      limit: number = 20
    ): Promise<UserExerciseMetric[]> {
      return await repos.exerciseMetrics.getByExerciseId(clientId, exerciseId, limit);
    },

    async getLastMetricForExercise(
      clientId: string,
      exerciseId: string
    ): Promise<UserExerciseMetric | undefined> {
      const history = await repos.exerciseMetrics.getByExerciseId(clientId, exerciseId, 1);
      return history[0];
    },

    async getMovementHistory(
      clientId: string,
      movementId: string,
      limit: number = 50
    ): Promise<UserExerciseMetricWithExercise[]> {
      return await repos.exerciseMetrics.getByMovementId(clientId, movementId, limit);
    },
  };
}

// Re-export types for convenience
export type {
  UserExerciseMetric,
  UserExerciseMetricWithExercise,
  ExerciseMetricData,
  StrengthMetricData,
  StrengthSetData,
  CardioMetricData,
  MobilityMetricData,
} from '../../../repositories/exerciseMetricsRepository';
