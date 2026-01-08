import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { RepositoryContainer } from '../../repositories/factory';

/**
 * WorkoutInstanceServiceInstance interface
 *
 * Pure CRUD operations for workout instances.
 * For workout generation/orchestration, use TrainingService.
 */
export interface WorkoutInstanceServiceInstance {
  getRecentWorkouts(userId: string, limit?: number): Promise<WorkoutInstance[]>;
  getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutInstance[]>;
  getWorkoutById(workoutId: string, userId: string): Promise<WorkoutInstance | null>;
  getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined>;
  getWorkoutByUserIdAndDate(userId: string, date: Date): Promise<WorkoutInstance | undefined>;
  updateWorkoutMessage(workoutId: string, message: string): Promise<WorkoutInstance | undefined>;
  createWorkout(workout: NewWorkoutInstance): Promise<WorkoutInstance>;
  updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate): Promise<WorkoutInstance | undefined>;
  deleteWorkout(workoutId: string, userId: string): Promise<boolean>;
  getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]>;
}

/**
 * Create a WorkoutInstanceService instance
 *
 * This is a pure CRUD service - no orchestration logic.
 * For generating workouts, use TrainingService.prepareWorkoutForDate().
 */
export function createWorkoutInstanceService(
  repos: RepositoryContainer
): WorkoutInstanceServiceInstance {
  return {
    async getRecentWorkouts(userId: string, limit: number = 10) {
      return await repos.workoutInstance.getRecentWorkouts(userId, limit);
    },

    async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
      return await repos.workoutInstance.getWorkoutsByDateRange(userId, startDate, endDate);
    },

    async getWorkoutById(workoutId: string, userId: string) {
      const workout = await repos.workoutInstance.getWorkoutById(workoutId);
      if (!workout || workout.clientId !== userId) {
        return null;
      }
      return workout;
    },

    async getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined> {
      return await repos.workoutInstance.getWorkoutById(workoutId);
    },

    async getWorkoutByUserIdAndDate(userId: string, date: Date) {
      return await repos.workoutInstance.findByClientIdAndDate(userId, date);
    },

    async updateWorkoutMessage(workoutId: string, message: string) {
      return await repos.workoutInstance.update(workoutId, { message });
    },

    async createWorkout(workout: NewWorkoutInstance) {
      return await repos.workoutInstance.create(workout);
    },

    async updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate) {
      return await repos.workoutInstance.update(workoutId, updates);
    },

    async deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
      const workout = await repos.workoutInstance.getWorkoutById(workoutId);
      if (!workout || workout.clientId !== userId) {
        return false;
      }
      return await repos.workoutInstance.delete(workoutId);
    },

    async getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]> {
      return await repos.workoutInstance.getWorkoutsByMicrocycle(userId, microcycleId);
    },
  };
}

// =============================================================================
