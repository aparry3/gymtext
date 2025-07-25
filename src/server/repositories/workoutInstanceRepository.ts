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
      .values(serializedData as any)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return result;
  }
}