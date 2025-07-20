import { WorkoutInstanceRepository } from '../repositories/workoutInstanceRepository';
import type { WorkoutInstance } from './_types';

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
      completedAt: completedAt || new Date(),
      status: 'completed'
    });
  }

  private validateWorkoutData(data: Partial<WorkoutInstance>): void {
    if (data.name !== undefined && (!data.name || data.name.trim().length < 2)) {
      throw new Error('Workout name must be at least 2 characters');
    }
    
    if (data.dayOfWeek !== undefined && (data.dayOfWeek < 1 || data.dayOfWeek > 7)) {
      throw new Error('Day of week must be between 1 and 7');
    }
    
    if (data.scheduledDate !== undefined && data.scheduledDate < new Date()) {
      throw new Error('Scheduled date cannot be in the past');
    }
  }
}