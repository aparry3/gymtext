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
      .onConflict((oc) => oc
        .columns(['clientId', 'date', 'sessionType'])
        .doUpdateSet({
          details: serializedData.details,
          updatedAt: new Date()
        })
      )
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
}