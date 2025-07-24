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
    const result = await this.db
      .insertInto('workoutInstances')
      .values(data as NewWorkoutInstance)
      .returningAll()
      .executeTakeFirstOrThrow();
    
    return result;
  }
}