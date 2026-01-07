import { createWorkoutAgentService, type WorkoutAgentService } from '@/server/services/agents/training';
import type { WorkoutInstanceUpdate, NewWorkoutInstance, WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { ActivityType, Microcycle } from '@/server/models/microcycle';
import type { ShortLinkServiceInstance } from '../links/shortLinkService';
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
  /** Inject contextService for late binding (called by factory after Phase 2) */
  injectContextService(ctx: ContextService): void;
  /** Inject progressService for late binding (called by factory after Phase 2) */
  injectProgressService(ps: ProgressServiceInstance): void;
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
  shortLink?: ShortLinkServiceInstance;
}

/**
 * Create a WorkoutInstanceService instance with injected dependencies
 */
export function createWorkoutInstanceService(
  repos: RepositoryContainer,
  initialDeps?: WorkoutInstanceServiceDeps
): WorkoutInstanceServiceInstance {
  // Mutable deps object that can be updated via injection
  let deps: WorkoutInstanceServiceDeps = { ...initialDeps };

  // Lazy load services to avoid circular dependencies
  let fitnessPlanService: FitnessPlanServiceInstance | null = deps?.fitnessPlan ?? null;
  let progressService: ProgressServiceInstance | null = deps?.progress ?? null;
  let shortLinkService: ShortLinkServiceInstance | null = deps?.shortLink ?? null;
  let workoutAgent: WorkoutAgentService | null = deps?.workoutAgent ?? null;

  const getServices = async () => {
    const { createServicesFromDb } = await import('../factory');
    const { postgresDb } = await import('@/server/connections/postgres/postgres');
    return createServicesFromDb(postgresDb);
  };

  const getFitnessPlanService = async (): Promise<FitnessPlanServiceInstance> => {
    if (!fitnessPlanService) {
      const services = await getServices();
      fitnessPlanService = services.fitnessPlan;
    }
    return fitnessPlanService;
  };

  const getProgressService = async (): Promise<ProgressServiceInstance> => {
    if (!progressService) {
      const services = await getServices();
      progressService = services.progress;
    }
    return progressService;
  };

  const getShortLinkService = async (): Promise<ShortLinkServiceInstance> => {
    if (!shortLinkService) {
      const services = await getServices();
      shortLinkService = services.shortLink;
    }
    return shortLinkService;
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
          const sls = await getShortLinkService();
          const shortLink = await sls.createWorkoutLink(user.id, savedWorkout.id);
          const fullUrl = sls.getFullUrl(shortLink.code);
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

    injectContextService(ctx: ContextService): void {
      deps = { ...deps, contextService: ctx };
      // Reset workoutAgent so it will be recreated with the new contextService
      workoutAgent = null;
    },

    injectProgressService(ps: ProgressServiceInstance): void {
      progressService = ps;
    },
  };
}

// =============================================================================
