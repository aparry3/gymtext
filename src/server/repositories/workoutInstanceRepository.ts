import { BaseRepository } from '@/server/repositories/baseRepository';
import type { 
  NewWorkoutInstance, 
  WorkoutInstance
} from '@/server/models/workout';

export class WorkoutInstanceRepository extends BaseRepository {
  /**
   * Create a new workout instance
   */
  async create(data: NewWorkoutInstance): Promise<WorkoutInstance> {
    // Ensure details field is properly serialized for JSONB column
    const serializedData = {
      ...data,
      details: typeof data.details === 'string' 
        ? data.details 
        : JSON.stringify(data.details)
    };
    
    const result = await this.db
      .insertInto('workoutInstances')
      .values(serializedData)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return result;
  }

  /**
   * Find workout instances for a client within a date range
   */
  async findByClientIdAndDateRange(
    clientId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<WorkoutInstance[]> {
    const results = await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'asc')
      .selectAll()
      .execute();
    
    return results;
  }

  /**
   * Find a single workout instance by client ID and date
   */
  async findByClientIdAndDate(
    clientId: string,
    date: Date
  ): Promise<WorkoutInstance | undefined> {
    const result = await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId)
      .where('date', '=', date)
      .selectAll()
      .executeTakeFirst();
    
    return result;
  }

  /**
   * Get recent workouts for a user
   * @param userId The user's ID
   * @param days Number of days to look back
   */
  async getRecentWorkouts(
    userId: string,
    days: number = 7
  ): Promise<WorkoutInstance[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const results = await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .orderBy('date', 'desc')
      .selectAll()
      .execute();
    
    return results;
  }

  /**
   * Get workout by specific date
   * @param userId The user's ID
   * @param date The specific date
   */
  async getWorkoutByDate(
    userId: string,
    date: Date
  ): Promise<WorkoutInstance | undefined> {
    return this.findByClientIdAndDate(userId, date);
  }

  /**
   * Update workout instance
   * @param id The workout ID
   * @param data The update data
   */
  async update(
    id: string,
    data: Partial<NewWorkoutInstance>
  ): Promise<WorkoutInstance | undefined> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    if (data.details) {
      updateData.details = typeof data.details === 'string' 
        ? data.details 
        : JSON.stringify(data.details);
    }
    
    const result = await this.db
      .updateTable('workoutInstances')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    
    return result;
  }

  /**
   * Delete old workout instances (cleanup)
   * @param daysToKeep Number of days to keep
   */
  async deleteOldWorkouts(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const result = await this.db
      .deleteFrom('workoutInstances')
      .where('date', '<', cutoffDate)
      .executeTakeFirst();
    
    return Number(result.numDeletedRows);
  }
}