/**
 * WorkoutInstanceService
 *
 * Domain service for managing workout instances.
 * Wraps WorkoutInstanceRepository to provide a clean interface.
 */
import type { WorkoutInstanceRepository, WorkoutInstanceRow, CreateWorkoutInstanceInput, UpdateWorkoutInstanceInput } from '@/server/repositories/workoutInstanceRepository';

export { type WorkoutInstanceRow, type CreateWorkoutInstanceInput, type UpdateWorkoutInstanceInput } from '@/server/repositories/workoutInstanceRepository';

/**
 * WorkoutInstanceServiceInstance interface
 */
export interface WorkoutInstanceServiceInstance {
  upsert(input: CreateWorkoutInstanceInput & UpdateWorkoutInstanceInput): Promise<WorkoutInstanceRow>;
  getByUserAndDate(userId: string, date: string): Promise<WorkoutInstanceRow | null>;
  getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<WorkoutInstanceRow[]>;
  delete(id: string): Promise<void>;
}

/**
 * Create a WorkoutInstanceService instance with injected repository
 */
export function createWorkoutInstanceService(workoutInstanceRepository: WorkoutInstanceRepository): WorkoutInstanceServiceInstance {
  return {
    async upsert(input: CreateWorkoutInstanceInput & UpdateWorkoutInstanceInput): Promise<WorkoutInstanceRow> {
      return workoutInstanceRepository.upsert(input);
    },

    async getByUserAndDate(userId: string, date: string): Promise<WorkoutInstanceRow | null> {
      return workoutInstanceRepository.getByUserAndDate(userId, date);
    },

    async getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<WorkoutInstanceRow[]> {
      return workoutInstanceRepository.getByUserId(userId, options);
    },

    async delete(id: string): Promise<void> {
      return workoutInstanceRepository.delete(id);
    },
  };
}
