import { now, startOfWeek, endOfWeek } from '@/shared/utils/date';
import { Microcycle, type MicrocycleStructure } from '@/server/models/microcycle';
import { FitnessPlan } from '@/server/models/fitnessPlan';
import { createMicrocycleAgentService, type MicrocycleAgentService } from '@/server/services/agents/training';
import type { UserWithProfile } from '@/server/models/user';
import type { ProgressInfo } from './progressService';
import type { RepositoryContainer } from '../../repositories/factory';
import type { UserServiceInstance } from '../user/userService';
import type { ContextService } from '../context';

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
  /** Create a microcycle record (CRUD) */
  createMicrocycle(data: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle>;
  /** @deprecated Use trainingService.prepareMicrocycleForDate instead */
  createMicrocycleFromProgress(clientId: string, plan: FitnessPlan, progress: ProgressInfo): Promise<Microcycle>;
  deleteMicrocycleWithWorkouts(microcycleId: string): Promise<{ deleted: boolean; deletedWorkoutsCount: number }>;
  /** Inject contextService for late binding (called by factory after Phase 2) */
  injectContextService(ctx: ContextService): void;
}

/**
 * Dependencies for MicrocycleService
 */
export interface MicrocycleServiceDeps {
  user?: UserServiceInstance;
  microcycleAgent?: MicrocycleAgentService;
  contextService?: ContextService;
}

/**
 * Create a MicrocycleService instance with injected dependencies
 */
export function createMicrocycleService(
  repos: RepositoryContainer,
  initialDeps?: MicrocycleServiceDeps
): MicrocycleServiceInstance {
  // Mutable deps object that can be updated via injection
  let deps: MicrocycleServiceDeps = { ...initialDeps };

  // Lazy load user service to avoid circular dependency
  let userService: UserServiceInstance | null = deps?.user ?? null;
  let microcycleAgent: MicrocycleAgentService | null = deps?.microcycleAgent ?? null;

  const getUserService = async (): Promise<UserServiceInstance> => {
    if (!userService) {
      const { createServicesFromDb } = await import('../factory');
      const { postgresDb } = await import('@/server/connections/postgres/postgres');
      const services = createServicesFromDb(postgresDb);
      userService = services.user;
    }
    return userService;
  };

  const getMicrocycleAgent = (): MicrocycleAgentService => {
    if (!microcycleAgent) {
      if (!deps?.contextService) {
        throw new Error('MicrocycleService requires either microcycleAgent or contextService to be provided');
      }
      microcycleAgent = createMicrocycleAgentService(deps.contextService);
    }
    return microcycleAgent;
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
      const result = await getMicrocycleAgent().generateMicrocycle(user, absoluteWeek);
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

    async createMicrocycle(data: Omit<Microcycle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Microcycle> {
      return await repos.microcycle.createMicrocycle(data);
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
      const { createServicesFromDb } = await import('../factory');
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

    injectContextService(ctx: ContextService): void {
      deps = { ...deps, contextService: ctx };
      // Reset microcycleAgent so it will be recreated with the new contextService
      microcycleAgent = null;
    },
  };
}

// =============================================================================
