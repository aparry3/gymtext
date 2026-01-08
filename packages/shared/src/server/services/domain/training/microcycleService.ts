import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { Microcycle } from '@/server/models/microcycle';
import type { RepositoryContainer } from '../../../repositories/factory';

/**
 * MicrocycleServiceInstance interface
 *
 * Pure CRUD and query operations for microcycles.
 * For microcycle generation/orchestration, use TrainingService.
 */
export interface MicrocycleServiceInstance {
  getActiveMicrocycle(clientId: string): Promise<Microcycle | null>;
  isActiveMicrocycleCurrent(clientId: string, timezone?: string): Promise<boolean>;
  getAllMicrocycles(clientId: string): Promise<Microcycle[]>;
  getMicrocycleByAbsoluteWeek(clientId: string, absoluteWeek: number): Promise<Microcycle | null>;
  getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null>;
  getMicrocycleById(microcycleId: string): Promise<Microcycle | null>;
  updateMicrocycleDays(microcycleId: string, days: string[]): Promise<Microcycle | null>;
  updateMicrocycle(microcycleId: string, microcycle: Partial<Microcycle>): Promise<Microcycle | null>;
  createMicrocycle(data: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle>;
  deleteMicrocycleWithWorkouts(microcycleId: string): Promise<{ deleted: boolean; deletedWorkoutsCount: number }>;
}

/**
 * Create a MicrocycleService instance
 *
 * This is primarily a CRUD service - no orchestration logic.
 * For generating microcycles, use TrainingService.prepareMicrocycleForDate().
 */
export function createMicrocycleService(
  repos: RepositoryContainer
): MicrocycleServiceInstance {
  const calculateWeekDates = (timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } => {
    const currentDate = now(timezone).toJSDate();
    return {
      startDate: startOfWeek(currentDate, timezone),
      endDate: endOfWeek(currentDate, timezone),
    };
  };

  return {
    async getActiveMicrocycle(clientId: string) {
      return await repos.microcycle.getActiveMicrocycle(clientId);
    },

    async isActiveMicrocycleCurrent(clientId: string, timezone: string = 'America/New_York'): Promise<boolean> {
      const activeMicrocycle = await repos.microcycle.getActiveMicrocycle(clientId);
      if (!activeMicrocycle) {
        return false;
      }

      const { startDate: currentWeekStart } = calculateWeekDates(timezone);
      const normalizedCurrentWeekStart = new Date(currentWeekStart);
      normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

      const activeMicrocycleStart = new Date(activeMicrocycle.startDate);
      activeMicrocycleStart.setHours(0, 0, 0, 0);

      const activeMicrocycleEnd = new Date(activeMicrocycle.endDate);
      activeMicrocycleEnd.setHours(0, 0, 0, 0);

      return normalizedCurrentWeekStart >= activeMicrocycleStart && normalizedCurrentWeekStart <= activeMicrocycleEnd;
    },

    async getAllMicrocycles(clientId: string) {
      return await repos.microcycle.getAllMicrocycles(clientId);
    },

    async getMicrocycleByAbsoluteWeek(clientId: string, absoluteWeek: number): Promise<Microcycle | null> {
      return await repos.microcycle.getMicrocycleByAbsoluteWeek(clientId, absoluteWeek);
    },

    async getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null> {
      return await repos.microcycle.getMicrocycleByDate(clientId, targetDate);
    },

    async getMicrocycleById(microcycleId: string): Promise<Microcycle | null> {
      return await repos.microcycle.getMicrocycleById(microcycleId);
    },

    async updateMicrocycleDays(microcycleId: string, days: string[]): Promise<Microcycle | null> {
      return await repos.microcycle.updateMicrocycle(microcycleId, { days });
    },

    async updateMicrocycle(microcycleId: string, microcycle: Partial<Microcycle>): Promise<Microcycle | null> {
      return await repos.microcycle.updateMicrocycle(microcycleId, microcycle);
    },

    async createMicrocycle(data: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle> {
      return await repos.microcycle.createMicrocycle(data);
    },

    async deleteMicrocycleWithWorkouts(
      microcycleId: string
    ): Promise<{ deleted: boolean; deletedWorkoutsCount: number }> {
      const microcycle = await repos.microcycle.getMicrocycleById(microcycleId);

      if (!microcycle) {
        return { deleted: false, deletedWorkoutsCount: 0 };
      }

      // Import workoutInstanceService dynamically to avoid circular dependency
      const { createServicesFromDb } = await import('../../factory');
      const { postgresDb } = await import('@/server/connections/postgres/postgres');
      const services = createServicesFromDb(postgresDb);

      const workouts = await services.workoutInstance.getWorkoutsByMicrocycle(microcycle.clientId, microcycleId);

      let deletedWorkoutsCount = 0;
      for (const workout of workouts) {
        const deleted = await services.workoutInstance.deleteWorkout(workout.id, microcycle.clientId);
        if (deleted) {
          deletedWorkoutsCount++;
        }
      }

      const deleted = await repos.microcycle.deleteMicrocycle(microcycleId);

      return { deleted, deletedWorkoutsCount };
    },
  };
}

// =============================================================================
