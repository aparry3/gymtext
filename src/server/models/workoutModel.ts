import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import type { WorkoutInstances } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

export class WorkoutModel {
  private workoutRepository: WorkoutInstanceRepository;

  constructor() {
    this.workoutRepository = new WorkoutInstanceRepository();
  }

  async createWorkout(workoutData: Partial<WorkoutInstance>): Promise<WorkoutInstance> {
    // Business logic validation
    this.validateWorkoutData(workoutData);
    
    return await this.workoutRepository.create(workoutData);
  }

  async getWorkoutById(id: string): Promise<WorkoutInstance | undefined> {
    return await this.workoutRepository.findById(id);
  }

  async updateWorkout(id: string, updates: Partial<WorkoutInstance>): Promise<WorkoutInstance> {
    // Business logic for updates
    this.validateWorkoutData(updates);
    
    return await this.workoutRepository.update(id, updates);
  }

  async deleteWorkout(id: string): Promise<void> {
    return await this.workoutRepository.delete(id);
  }

  async markWorkoutComplete(id: string, completedAt?: Date): Promise<WorkoutInstance> {
    const workout = await this.workoutRepository.findById(id);
    if (!workout) {
      throw new Error('Workout not found');
    }
    
    if (workout.completedAt) {
      throw new Error('Workout is already completed');
    }
    
    return await this.workoutRepository.update(id, {
      completedAt: completedAt || new Date()
    });
  }

  private validateWorkoutData(data: Partial<WorkoutInstance>): void {
    if (data.sessionType !== undefined && !data.sessionType) {
      throw new Error('Session type is required');
    }
    
    if (data.date !== undefined && !data.date) {
      throw new Error('Workout date is required');
    }
    
    if (data.goal !== undefined && data.goal && data.goal.length > 500) {
      throw new Error('Goal description cannot exceed 500 characters');
    }
  }
}