import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
  }

  public static getInstance(): WorkoutInstanceService {
    if (!WorkoutInstanceService.instance) {
      WorkoutInstanceService.instance = new WorkoutInstanceService();
    }
    return WorkoutInstanceService.instance;
  }

  /**
   * Get recent workouts for a user
   */
  public async getRecentWorkouts(userId: string, limit: number = 10) {
    return await this.workoutRepo.getRecentWorkouts(userId, limit);
  }

  /**
   * Get workouts by date range
   */
  public async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
  }

  /**
   * Get a specific workout by ID and verify it belongs to the user
   */
  public async getWorkoutById(workoutId: string, userId: string) {
    const workout = await this.workoutRepo.getWorkoutById(workoutId);
    
    if (!workout || workout.clientId !== userId) {
      return null;
    }
    
    return workout;
  }
}

// Export singleton instance
export const workoutInstanceService = WorkoutInstanceService.getInstance();