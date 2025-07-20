import { BaseRepository } from './baseRepository';
import type { 
  WorkoutInstanceRow, 
  NewWorkoutInstance, 
  WorkoutInstanceUpdate 
} from '../types/cycleTypes';
import type { Json, JsonValue } from '@/server/models/_types';

export class WorkoutInstanceRepository extends BaseRepository {
  /**
   * Create a new workout instance
   */
  async createWorkoutInstance(data: NewWorkoutInstance): Promise<string> {
    const result = await this.db
      .insertInto('workoutInstances')
      .values(data)
      .returning('id')
      .executeTakeFirstOrThrow();
    
    return result.id;
  }

  /**
   * Create multiple workout instances in a batch
   */
  async createWorkoutInstances(workouts: NewWorkoutInstance[]): Promise<string[]> {
    const results = await this.db
      .insertInto('workoutInstances')
      .values(workouts)
      .returning('id')
      .execute();
    
    return results.map(r => r.id);
  }

  /**
   * Get a workout instance by ID
   */
  async getWorkoutInstanceById(id: string): Promise<WorkoutInstanceRow | null> {
    const result = await this.db
      .selectFrom('workoutInstances')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
    
    return result || null;
  }

  /**
   * Get all workout instances for a microcycle
   */
  async getWorkoutsByMicrocycleId(microcycleId: string): Promise<WorkoutInstanceRow[]> {
    return await this.db
      .selectFrom('workoutInstances')
      .where('microcycleId', '=', microcycleId)
      .orderBy('date', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get all workout instances for a mesocycle
   */
  async getWorkoutsByMesocycleId(mesocycleId: string): Promise<WorkoutInstanceRow[]> {
    return await this.db
      .selectFrom('workoutInstances')
      .where('mesocycleId', '=', mesocycleId)
      .orderBy('date', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get all workout instances for a fitness plan
   */
  async getWorkoutsByPlanId(fitnessPlanId: string): Promise<WorkoutInstanceRow[]> {
    return await this.db
      .selectFrom('workoutInstances')
      .where('fitnessPlanId', '=', fitnessPlanId)
      .orderBy('date', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Get workout instances for a client on a specific date
   */
  async getWorkoutsByClientAndDate(
    clientId: string, 
    date: Date
  ): Promise<WorkoutInstanceRow[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId)
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .selectAll()
      .execute();
  }

  /**
   * Get upcoming workouts for a client
   */
  async getUpcomingWorkouts(
    clientId: string, 
    daysAhead: number = 7
  ): Promise<WorkoutInstanceRow[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId)
      .where('date', '>=', now)
      .where('date', '<=', futureDate)
      .where('completedAt', 'is', null) // Not completed yet
      .orderBy('date', 'asc')
      .selectAll()
      .execute();
  }

  /**
   * Update a workout instance
   */
  async updateWorkoutInstance(id: string, data: WorkoutInstanceUpdate): Promise<void> {
    await this.db
      .updateTable('workoutInstances')
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where('id', '=', id)
      .execute();
  }

  /**
   * Mark workout as completed
   */
  async markWorkoutCompleted(id: string): Promise<void> {
    await this.updateWorkoutInstance(id, {
      completedAt: new Date()
    });
  }

  /**
   * Add alterations to a workout
   */
  async addWorkoutAlterations(
    id: string, 
    alterations: Record<string, JsonValue>
  ): Promise<void> {
    await this.updateWorkoutInstance(id, { 
      alterations: alterations as Json 
    });
  }

  /**
   * Delete a workout instance
   */
  async deleteWorkoutInstance(id: string): Promise<void> {
    await this.db
      .deleteFrom('workoutInstances')
      .where('id', '=', id)
      .execute();
  }

  /**
   * Get completed workouts for a client in a date range
   */
  async getCompletedWorkouts(
    clientId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WorkoutInstanceRow[]> {
    return await this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId)
      .where('completedAt', 'is not', null)
      .where('completedAt', '>=', startDate)
      .where('completedAt', '<=', endDate)
      .orderBy('completedAt', 'desc')
      .selectAll()
      .execute();
  }

  /**
   * Get workout completion stats for a client
   */
  async getWorkoutStats(
    clientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    total: number;
    completed: number;
    notCompleted: number;
  }> {
    let query = this.db
      .selectFrom('workoutInstances')
      .where('clientId', '=', clientId);
    
    if (startDate) {
      query = query.where('date', '>=', startDate);
    }
    if (endDate) {
      query = query.where('date', '<=', endDate);
    }
    
    const workouts = await query.select('completedAt').execute();
    
    const completed = workouts.filter(w => w.completedAt !== null).length;
    
    return {
      total: workouts.length,
      completed,
      notCompleted: workouts.length - completed
    };
  }
}