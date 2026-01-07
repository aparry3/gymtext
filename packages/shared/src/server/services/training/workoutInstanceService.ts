import { createWorkoutAgentService, type WorkoutAgentService } from '@/server/services/agents/training';
import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { ActivityType, Microcycle } from '@/server/models/microcycle';
import { shortLinkService } from '../links/shortLinkService';
import { DateTime } from 'luxon';
import { getWeekday, getDayOfWeekName } from '@/shared/utils/date';
import { normalizeWhitespace } from '@/server/utils/formatters';
import type { RepositoryContainer } from '../../repositories/factory';
import type { FitnessPlanServiceInstance } from './fitnessPlanService';
import type { ProgressServiceInstance } from './progressService';
import type { MicrocycleServiceInstance } from './microcycleService';
import type { ContextService } from '../context';

/**
 * WorkoutInstanceServiceInstance interface
 */
export interface WorkoutInstanceServiceInstance {
  getRecentWorkouts(userId: string, limit?: number): Promise<WorkoutInstance[]>;
  getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkoutInstance[]>;
  getWorkoutById(workoutId: string, userId: string): Promise<WorkoutInstance | null>;
  getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined>;
  getWorkoutByUserIdAndDate(userId: string, date: Date): Promise<WorkoutInstance | undefined>;
  updateWorkoutMessage(workoutId: string, message: string): Promise<WorkoutInstance | undefined>;
  createWorkout(workout: NewWorkoutInstance): Promise<WorkoutInstance>;
  updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate): Promise<WorkoutInstance | undefined>;
  generateWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime,
    providedMicrocycle?: Microcycle
  ): Promise<WorkoutInstance | null>;
  deleteWorkout(workoutId: string, userId: string): Promise<boolean>;
  getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]>;
}

/**
 * Dependencies for WorkoutInstanceService
 */
export interface WorkoutInstanceServiceDeps {
  fitnessPlan?: FitnessPlanServiceInstance;
  progress?: ProgressServiceInstance;
  microcycle?: MicrocycleServiceInstance;
  workoutAgent?: WorkoutAgentService;
  contextService?: ContextService;
}

/**
 * Create a WorkoutInstanceService instance with injected dependencies
 */
export function createWorkoutInstanceService(
  repos: RepositoryContainer,
  deps?: WorkoutInstanceServiceDeps
): WorkoutInstanceServiceInstance {
  // Lazy load services to avoid circular dependencies
  let fitnessPlanService: FitnessPlanServiceInstance | null = deps?.fitnessPlan ?? null;
  let progressService: ProgressServiceInstance | null = deps?.progress ?? null;
  let workoutAgent: WorkoutAgentService | null = deps?.workoutAgent ?? null;

  const getFitnessPlanService = async (): Promise<FitnessPlanServiceInstance> => {
    if (!fitnessPlanService) {
      const { FitnessPlanService } = await import('./fitnessPlanService');
      fitnessPlanService = FitnessPlanService.getInstance();
    }
    return fitnessPlanService;
  };

  const getProgressService = async (): Promise<ProgressServiceInstance> => {
    if (!progressService) {
      const { ProgressService } = await import('./progressService');
      progressService = ProgressService.getInstance();
    }
    return progressService;
  };

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) {
      if (!deps?.contextService) {
        throw new Error('WorkoutInstanceService requires either workoutAgent or contextService to be provided');
      }
      workoutAgent = createWorkoutAgentService(deps.contextService);
    }
    return workoutAgent;
  };

  return {
    async getRecentWorkouts(userId: string, limit: number = 10) {
      return await repos.workoutInstance.getRecentWorkouts(userId, limit);
    },

    async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
      return await repos.workoutInstance.getWorkoutsByDateRange(userId, startDate, endDate);
    },

    async getWorkoutById(workoutId: string, userId: string) {
      const workout = await repos.workoutInstance.getWorkoutById(workoutId);
      if (!workout || workout.clientId !== userId) {
        return null;
      }
      return workout;
    },

    async getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined> {
      return await repos.workoutInstance.getWorkoutById(workoutId);
    },

    async getWorkoutByUserIdAndDate(userId: string, date: Date) {
      return await repos.workoutInstance.findByClientIdAndDate(userId, date);
    },

    async updateWorkoutMessage(workoutId: string, message: string) {
      return await repos.workoutInstance.update(workoutId, { message });
    },

    async createWorkout(workout: NewWorkoutInstance) {
      return await repos.workoutInstance.create(workout);
    },

    async updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate) {
      return await repos.workoutInstance.update(workoutId, updates);
    },

    async generateWorkoutForDate(
      user: UserWithProfile,
      targetDate: DateTime,
      providedMicrocycle?: Microcycle
    ): Promise<WorkoutInstance | null> {
      try {
        const fps = await getFitnessPlanService();
        const plan = await fps.getCurrentPlan(user.id);
        if (!plan) {
          console.log(`No fitness plan found for user ${user.id}`);
          return null;
        }

        const ps = await getProgressService();
        const progress = await ps.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
        if (!progress) {
          console.log(`No progress found for user ${user.id} on ${targetDate.toISODate()}`);
          return null;
        }

        let microcycle: Microcycle | null = providedMicrocycle ?? null;
        if (!microcycle) {
          const result = await ps.getOrCreateMicrocycleForDate(user.id, plan, targetDate.toJSDate(), user.timezone);
          microcycle = result.microcycle;
        }
        if (!microcycle) {
          console.log(`Could not get/create microcycle for user ${user.id}`);
          return null;
        }

        const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
        const dayOverview = microcycle.days?.[dayIndex];

        if (!dayOverview || typeof dayOverview !== 'string') {
          console.log(`No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
          return null;
        }

        const structuredDay = microcycle.structured?.days?.[dayIndex];
        const activityType = structuredDay?.activityType as ActivityType | undefined;

        const { response: description, message, structure } = await getWorkoutAgent().generateWorkout(
          user,
          dayOverview,
          microcycle.isDeload ?? false,
          activityType
        );

        const theme = structure?.title || 'Workout';
        const details = { theme };

        const workout: NewWorkoutInstance = {
          clientId: user.id,
          microcycleId: microcycle.id,
          date: targetDate.toJSDate(),
          sessionType: 'workout',
          goal: dayOverview.substring(0, 100),
          details: JSON.parse(JSON.stringify(details)),
          description,
          message,
          structured: structure,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const savedWorkout = await repos.workoutInstance.create(workout);
        console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

        try {
          const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
          const fullUrl = shortLinkService.getFullUrl(shortLink.code);
          console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);

          if (savedWorkout.message) {
            const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone);
            savedWorkout.message = normalizeWhitespace(
              `${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${fullUrl})`
            );
            await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
          }
        } catch (error) {
          console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
        }

        return savedWorkout;
      } catch (error) {
        console.error(`Error generating workout for user ${user.id}:`, error);
        throw error;
      }
    },

    async deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
      const workout = await repos.workoutInstance.getWorkoutById(workoutId);
      if (!workout || workout.clientId !== userId) {
        return false;
      }
      return await repos.workoutInstance.delete(workoutId);
    },

    async getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]> {
      return await repos.workoutInstance.getWorkoutsByMicrocycle(userId, microcycleId);
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { FitnessPlanService } from './fitnessPlanService';
import { ProgressService } from './progressService';
import { MicrocycleService } from './microcycleService';
import { createContextService } from '../context';

/**
 * @deprecated Use createWorkoutInstanceService(repos, deps) instead
 */
export class WorkoutInstanceService {
  private static instance: WorkoutInstanceService;
  private workoutRepo: WorkoutInstanceRepository;
  private fitnessPlanService: FitnessPlanService;
  private progressService: ProgressService;
  private microcycleService: MicrocycleService;
  private workoutAgent: WorkoutAgentService | null = null;

  private constructor() {
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
  }

  public static getInstance(): WorkoutInstanceService {
    if (!WorkoutInstanceService.instance) {
      WorkoutInstanceService.instance = new WorkoutInstanceService();
    }
    return WorkoutInstanceService.instance;
  }

  private getWorkoutAgent(): WorkoutAgentService {
    if (!this.workoutAgent) {
      // Lazily create agent service using production singletons
      // Use require to avoid circular dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const services = require('@/server/services');
      const contextService = createContextService({
        fitnessPlanService: services.fitnessPlanService,
        workoutInstanceService: services.workoutInstanceService,
        microcycleService: services.microcycleService,
        fitnessProfileService: services.fitnessProfileService,
      });
      this.workoutAgent = createWorkoutAgentService(contextService);
    }
    return this.workoutAgent;
  }

  public async getRecentWorkouts(userId: string, limit: number = 10) {
    return await this.workoutRepo.getRecentWorkouts(userId, limit);
  }

  public async getWorkoutsByDateRange(userId: string, startDate: Date, endDate: Date) {
    return await this.workoutRepo.getWorkoutsByDateRange(userId, startDate, endDate);
  }

  public async getWorkoutById(workoutId: string, userId: string) {
    const workout = await this.workoutRepo.getWorkoutById(workoutId);
    if (!workout || workout.clientId !== userId) {
      return null;
    }
    return workout;
  }

  public async getWorkoutByIdInternal(workoutId: string): Promise<WorkoutInstance | undefined> {
    return await this.workoutRepo.getWorkoutById(workoutId);
  }

  public async getWorkoutByUserIdAndDate(userId: string, date: Date) {
    return await this.workoutRepo.findByClientIdAndDate(userId, date);
  }

  public async updateWorkoutMessage(workoutId: string, message: string) {
    return await this.workoutRepo.update(workoutId, { message });
  }

  public async createWorkout(workout: NewWorkoutInstance) {
    return await this.workoutRepo.create(workout);
  }

  public async updateWorkout(workoutId: string, updates: WorkoutInstanceUpdate) {
    return await this.workoutRepo.update(workoutId, updates);
  }

  public async generateWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime,
    providedMicrocycle?: Microcycle
  ): Promise<WorkoutInstance | null> {
    try {
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        console.log(`No fitness plan found for user ${user.id}`);
        return null;
      }

      const progress = await this.progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
      if (!progress) {
        console.log(`No progress found for user ${user.id} on ${targetDate.toISODate()}`);
        return null;
      }

      let microcycle: Microcycle | null = providedMicrocycle ?? null;
      if (!microcycle) {
        const result = await this.progressService.getOrCreateMicrocycleForDate(
          user.id,
          plan,
          targetDate.toJSDate(),
          user.timezone
        );
        microcycle = result.microcycle;
      }
      if (!microcycle) {
        console.log(`Could not get/create microcycle for user ${user.id}`);
        return null;
      }

      const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
      const dayOverview = microcycle.days?.[dayIndex];

      if (!dayOverview || typeof dayOverview !== 'string') {
        console.log(`No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
        return null;
      }

      const structuredDay = microcycle.structured?.days?.[dayIndex];
      const activityType = structuredDay?.activityType as ActivityType | undefined;

      const { response: description, message, structure } = await this.getWorkoutAgent().generateWorkout(
        user,
        dayOverview,
        microcycle.isDeload ?? false,
        activityType
      );

      const theme = structure?.title || 'Workout';
      const details = { theme };

      const workout: NewWorkoutInstance = {
        clientId: user.id,
        microcycleId: microcycle.id,
        date: targetDate.toJSDate(),
        sessionType: 'workout',
        goal: dayOverview.substring(0, 100),
        details: JSON.parse(JSON.stringify(details)),
        description,
        message,
        structured: structure,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedWorkout = await this.createWorkout(workout);
      console.log(`Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

      try {
        const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
        const fullUrl = shortLinkService.getFullUrl(shortLink.code);
        console.log(`Created short link for workout ${savedWorkout.id}: ${fullUrl}`);

        if (savedWorkout.message) {
          const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone);
          savedWorkout.message = normalizeWhitespace(
            `${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${fullUrl})`
          );
          await this.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
        }
      } catch (error) {
        console.error(`Failed to create short link for workout ${savedWorkout.id}:`, error);
      }

      return savedWorkout;
    } catch (error) {
      console.error(`Error generating workout for user ${user.id}:`, error);
      throw error;
    }
  }

  public async deleteWorkout(workoutId: string, userId: string): Promise<boolean> {
    const workout = await this.workoutRepo.getWorkoutById(workoutId);
    if (!workout || workout.clientId !== userId) {
      return false;
    }
    return await this.workoutRepo.delete(workoutId);
  }

  public async getWorkoutsByMicrocycle(userId: string, microcycleId: string): Promise<WorkoutInstance[]> {
    return await this.workoutRepo.getWorkoutsByMicrocycle(userId, microcycleId);
  }
}

/**
 * @deprecated Use createWorkoutInstanceService(repos, deps) instead
 */
export const workoutInstanceService = WorkoutInstanceService.getInstance();
