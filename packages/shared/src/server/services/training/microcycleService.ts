import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { Microcycle, type MicrocycleStructure } from '@/server/models/microcycle';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import { microcycleAgentService } from '@/server/services/agents/training';
import type { UserWithProfile } from '@/server/models/user';
import type { ProgressInfo } from './progressService';
import type { RepositoryContainer } from '../../repositories/factory';
import type { UserServiceInstance } from '../user/userService';

/**
 * MicrocycleServiceInstance interface
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
  createMicrocycleFromProgress(clientId: string, plan: FitnessPlan, progress: ProgressInfo): Promise<Microcycle>;
  deleteMicrocycleWithWorkouts(microcycleId: string): Promise<{ deleted: boolean; deletedWorkoutsCount: number }>;
}

/**
 * Create a MicrocycleService instance with injected dependencies
 */
export function createMicrocycleService(
  repos: RepositoryContainer,
  deps?: { user?: UserServiceInstance }
): MicrocycleServiceInstance {
  // Lazy load user service to avoid circular dependency
  let userService: UserServiceInstance | null = deps?.user ?? null;

  const getUserService = async (): Promise<UserServiceInstance> => {
    if (!userService) {
      const { UserService } = await import('../user/userService');
      userService = UserService.getInstance();
    }
    return userService;
  };

  const calculateWeekDates = (timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } => {
    const currentDate = now(timezone).toJSDate();
    return {
      startDate: startOfWeek(currentDate, timezone),
      endDate: endOfWeek(currentDate, timezone),
    };
  };

  const generateMicrocycle = async (
    user: UserWithProfile,
    absoluteWeek: number
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
  }> => {
    try {
      const result = await microcycleAgentService.generateMicrocycle(user, absoluteWeek);
      console.log(`[MicrocycleService] Generated microcycle for week ${absoluteWeek}, isDeload=${result.isDeload}`);
      return result;
    } catch (error) {
      console.error('[MicrocycleService] Failed to generate microcycle:', error);
      throw error;
    }
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

    async createMicrocycleFromProgress(
      clientId: string,
      plan: FitnessPlan,
      progress: ProgressInfo
    ): Promise<Microcycle> {
      const us = await getUserService();
      const user = await us.getUser(clientId);
      if (!user) {
        throw new Error(`Client not found: ${clientId}`);
      }

      const { days, description, isDeload, message, structure } = await generateMicrocycle(user, progress.absoluteWeek);

      const microcycle = await repos.microcycle.createMicrocycle({
        clientId,
        absoluteWeek: progress.absoluteWeek,
        days,
        description,
        isDeload,
        message,
        structured: structure,
        startDate: progress.weekStartDate,
        endDate: progress.weekEndDate,
        isActive: false,
      });

      console.log(
        `[MicrocycleService] Created microcycle for client ${clientId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`
      );
      return microcycle;
    },

    async deleteMicrocycleWithWorkouts(
      microcycleId: string
    ): Promise<{ deleted: boolean; deletedWorkoutsCount: number }> {
      const microcycle = await repos.microcycle.getMicrocycleById(microcycleId);

      if (!microcycle) {
        return { deleted: false, deletedWorkoutsCount: 0 };
      }

      // Import workoutInstanceService dynamically to avoid circular dependency
      const { workoutInstanceService } = await import('./workoutInstanceService');

      const workouts = await workoutInstanceService.getWorkoutsByMicrocycle(microcycle.clientId, microcycleId);

      let deletedWorkoutsCount = 0;
      for (const workout of workouts) {
        const deleted = await workoutInstanceService.deleteWorkout(workout.id, microcycle.clientId);
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
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { UserService } from '../user/userService';

/**
 * @deprecated Use createMicrocycleService(repos, deps) instead
 */
export class MicrocycleService {
  private static instance: MicrocycleService;
  private microcycleRepo: MicrocycleRepository;
  private userService: UserService;

  private constructor() {
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MicrocycleService {
    if (!MicrocycleService.instance) {
      MicrocycleService.instance = new MicrocycleService();
    }
    return MicrocycleService.instance;
  }

  public async getActiveMicrocycle(clientId: string) {
    return await this.microcycleRepo.getActiveMicrocycle(clientId);
  }

  public async isActiveMicrocycleCurrent(clientId: string, timezone: string = 'America/New_York'): Promise<boolean> {
    const activeMicrocycle = await this.microcycleRepo.getActiveMicrocycle(clientId);
    if (!activeMicrocycle) {
      return false;
    }

    const { startDate: currentWeekStart } = this.calculateWeekDates(timezone);
    const normalizedCurrentWeekStart = new Date(currentWeekStart);
    normalizedCurrentWeekStart.setHours(0, 0, 0, 0);

    const activeMicrocycleStart = new Date(activeMicrocycle.startDate);
    activeMicrocycleStart.setHours(0, 0, 0, 0);

    const activeMicrocycleEnd = new Date(activeMicrocycle.endDate);
    activeMicrocycleEnd.setHours(0, 0, 0, 0);

    return normalizedCurrentWeekStart >= activeMicrocycleStart && normalizedCurrentWeekStart <= activeMicrocycleEnd;
  }

  public async getAllMicrocycles(clientId: string) {
    return await this.microcycleRepo.getAllMicrocycles(clientId);
  }

  public async getMicrocycleByAbsoluteWeek(clientId: string, absoluteWeek: number): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByAbsoluteWeek(clientId, absoluteWeek);
  }

  public async getMicrocycleByDate(clientId: string, targetDate: Date): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleByDate(clientId, targetDate);
  }

  public async getMicrocycleById(microcycleId: string): Promise<Microcycle | null> {
    return await this.microcycleRepo.getMicrocycleById(microcycleId);
  }

  public async updateMicrocycleDays(microcycleId: string, days: string[]): Promise<Microcycle | null> {
    return await this.microcycleRepo.updateMicrocycle(microcycleId, { days });
  }

  public async updateMicrocycle(microcycleId: string, microcycle: Partial<Microcycle>): Promise<Microcycle | null> {
    return await this.microcycleRepo.updateMicrocycle(microcycleId, microcycle);
  }

  public async createMicrocycleFromProgress(
    clientId: string,
    plan: FitnessPlan,
    progress: ProgressInfo
  ): Promise<Microcycle> {
    const user = await this.userService.getUser(clientId);
    if (!user) {
      throw new Error(`Client not found: ${clientId}`);
    }

    const { days, description, isDeload, message, structure } = await this.generateMicrocycle(
      user,
      progress.absoluteWeek
    );

    const microcycle = await this.microcycleRepo.createMicrocycle({
      clientId,
      absoluteWeek: progress.absoluteWeek,
      days,
      description,
      isDeload,
      message,
      structured: structure,
      startDate: progress.weekStartDate,
      endDate: progress.weekEndDate,
      isActive: false,
    });

    console.log(
      `[MicrocycleService] Created microcycle for client ${clientId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`
    );
    return microcycle;
  }

  private async generateMicrocycle(
    user: UserWithProfile,
    absoluteWeek: number
  ): Promise<{
    days: string[];
    description: string;
    isDeload: boolean;
    message: string;
    structure?: MicrocycleStructure;
  }> {
    try {
      const result = await microcycleAgentService.generateMicrocycle(user, absoluteWeek);
      console.log(`[MicrocycleService] Generated microcycle for week ${absoluteWeek}, isDeload=${result.isDeload}`);
      return result;
    } catch (error) {
      console.error('[MicrocycleService] Failed to generate microcycle:', error);
      throw error;
    }
  }

  private calculateWeekDates(timezone: string = 'America/New_York'): { startDate: Date; endDate: Date } {
    const currentDate = now(timezone).toJSDate();
    return {
      startDate: startOfWeek(currentDate, timezone),
      endDate: endOfWeek(currentDate, timezone),
    };
  }

  public async deleteMicrocycleWithWorkouts(
    microcycleId: string
  ): Promise<{ deleted: boolean; deletedWorkoutsCount: number }> {
    const microcycle = await this.microcycleRepo.getMicrocycleById(microcycleId);

    if (!microcycle) {
      return { deleted: false, deletedWorkoutsCount: 0 };
    }

    const { workoutInstanceService } = await import('./workoutInstanceService');

    const workouts = await workoutInstanceService.getWorkoutsByMicrocycle(microcycle.clientId, microcycleId);

    let deletedWorkoutsCount = 0;
    for (const workout of workouts) {
      const deleted = await workoutInstanceService.deleteWorkout(workout.id, microcycle.clientId);
      if (deleted) {
        deletedWorkoutsCount++;
      }
    }

    const deleted = await this.microcycleRepo.deleteMicrocycle(microcycleId);

    return { deleted, deletedWorkoutsCount };
  }
}

/**
 * @deprecated Use createMicrocycleService(repos, deps) instead
 */
export const microcycleService = MicrocycleService.getInstance();
