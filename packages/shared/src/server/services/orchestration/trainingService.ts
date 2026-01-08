/**
 * TrainingService
 *
 * Orchestrates training-related workflows including workout generation,
 * microcycle creation, and coordination between domain services and AI agents.
 *
 * This service follows the orchestration pattern - it coordinates between
 * domain services (CRUD) and agent services (AI) without doing either directly.
 */
import { DateTime } from 'luxon';
import { getWeekday, getDayOfWeekName } from '@/shared/utils/date';
import { normalizeWhitespace } from '@/server/utils/formatters';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle, ActivityType } from '@/server/models/microcycle';
import type { WorkoutInstance, NewWorkoutInstance } from '@/server/models/workout';
import type { ProgressInfo } from '../domain/training/progressService';

// Domain services
import type { UserServiceInstance } from '../domain/user/userService';
import type { FitnessPlanServiceInstance } from '../domain/training/fitnessPlanService';
import type { ProgressServiceInstance } from '../domain/training/progressService';
import type { MicrocycleServiceInstance } from '../domain/training/microcycleService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { ShortLinkServiceInstance } from '../domain/links/shortLinkService';

// Agent services
import type { WorkoutAgentService } from '../agents/training/workoutAgentService';
import type { MicrocycleAgentService } from '../agents/training/microcycleAgentService';

// =============================================================================
// Types
// =============================================================================

export interface TrainingServiceInstance {
  /**
   * Generate a workout for a specific date
   * Orchestrates: fitness plan lookup, progress calculation, microcycle creation, workout generation
   */
  prepareWorkoutForDate(
    user: UserWithProfile,
    targetDate: DateTime,
    providedMicrocycle?: Microcycle
  ): Promise<WorkoutInstance | null>;

  /**
   * Generate a microcycle for a specific date/week
   * Orchestrates: user lookup, progress calculation, AI generation, database storage
   */
  prepareMicrocycleForDate(
    userId: string,
    plan: FitnessPlan,
    targetDate: Date,
    timezone?: string
  ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }>;
}

export interface TrainingServiceDeps {
  // Domain services
  user: UserServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  progress: ProgressServiceInstance;
  microcycle: MicrocycleServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  shortLink: ShortLinkServiceInstance;

  // Agent services
  workoutAgent: WorkoutAgentService;
  microcycleAgent: MicrocycleAgentService;
}

// =============================================================================
// Factory
// =============================================================================

/**
 * Create a TrainingService instance with injected dependencies
 */
export function createTrainingService(deps: TrainingServiceDeps): TrainingServiceInstance {
  const {
    user: userService,
    fitnessPlan: fitnessPlanService,
    progress: progressService,
    microcycle: microcycleService,
    workoutInstance: workoutInstanceService,
    shortLink: shortLinkService,
    workoutAgent,
    microcycleAgent,
  } = deps;

  return {
    async prepareWorkoutForDate(
      user: UserWithProfile,
      targetDate: DateTime,
      providedMicrocycle?: Microcycle
    ): Promise<WorkoutInstance | null> {
      try {
        // 1. Get current fitness plan
        const plan = await fitnessPlanService.getCurrentPlan(user.id);
        if (!plan) {
          console.log(`[TrainingService] No fitness plan found for user ${user.id}`);
          return null;
        }

        // 2. Get progress for the target date
        const progress = await progressService.getProgressForDate(plan, targetDate.toJSDate(), user.timezone);
        if (!progress) {
          console.log(`[TrainingService] No progress found for user ${user.id} on ${targetDate.toISODate()}`);
          return null;
        }

        // 3. Get or create microcycle for the week
        let microcycle: Microcycle | null = providedMicrocycle ?? null;
        if (!microcycle) {
          const result = await this.prepareMicrocycleForDate(user.id, plan, targetDate.toJSDate(), user.timezone);
          microcycle = result.microcycle;
        }
        if (!microcycle) {
          console.log(`[TrainingService] Could not get/create microcycle for user ${user.id}`);
          return null;
        }

        // 4. Extract day overview from microcycle
        const dayIndex = getWeekday(targetDate.toJSDate(), user.timezone) - 1;
        const dayOverview = microcycle.days?.[dayIndex];

        if (!dayOverview || typeof dayOverview !== 'string') {
          console.log(`[TrainingService] No overview found for day index ${dayIndex} in microcycle ${microcycle.id}`);
          return null;
        }

        const structuredDay = microcycle.structured?.days?.[dayIndex];
        const activityType = structuredDay?.activityType as ActivityType | undefined;

        // 5. Generate workout via AI agent
        const { response: description, message, structure } = await workoutAgent.generateWorkout(
          user,
          dayOverview,
          microcycle.isDeload ?? false,
          activityType
        );

        const theme = structure?.title || 'Workout';
        const details = { theme };

        // 6. Create workout record
        const workoutData: NewWorkoutInstance = {
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

        const savedWorkout = await workoutInstanceService.createWorkout(workoutData);
        console.log(`[TrainingService] Generated and saved workout for user ${user.id} on ${targetDate.toISODate()}`);

        // 7. Create short link and update message
        try {
          const shortLink = await shortLinkService.createWorkoutLink(user.id, savedWorkout.id);
          const fullUrl = shortLinkService.getFullUrl(shortLink.code);
          console.log(`[TrainingService] Created short link for workout ${savedWorkout.id}: ${fullUrl}`);

          if (savedWorkout.message) {
            const dayOfWeekTitle = getDayOfWeekName(targetDate.toJSDate(), user.timezone);
            savedWorkout.message = normalizeWhitespace(
              `${dayOfWeekTitle}\n\n${savedWorkout.message}\n\n(More details: ${fullUrl})`
            );
            await workoutInstanceService.updateWorkoutMessage(savedWorkout.id, savedWorkout.message);
          }
        } catch (error) {
          console.error(`[TrainingService] Failed to create short link for workout ${savedWorkout.id}:`, error);
        }

        return savedWorkout;
      } catch (error) {
        console.error(`[TrainingService] Error generating workout for user ${user.id}:`, error);
        throw error;
      }
    },

    async prepareMicrocycleForDate(
      userId: string,
      plan: FitnessPlan,
      targetDate: Date,
      timezone: string = 'America/New_York'
    ): Promise<{ microcycle: Microcycle; progress: ProgressInfo; wasCreated: boolean }> {
      // 1. Calculate progress for the date
      const progress = await progressService.getProgressForDate(plan, targetDate, timezone);
      if (!progress) {
        throw new Error(`[TrainingService] Could not calculate progress for date ${targetDate}`);
      }

      // 2. Check if microcycle already exists
      if (progress.microcycle) {
        return { microcycle: progress.microcycle, progress, wasCreated: false };
      }

      // 3. Get user for AI context
      const user = await userService.getUser(userId);
      if (!user) {
        throw new Error(`[TrainingService] User not found: ${userId}`);
      }

      // 4. Generate microcycle via AI agent
      const { days, description, isDeload, message, structure } = await microcycleAgent.generateMicrocycle(
        user,
        progress.absoluteWeek
      );

      // 5. Create microcycle record
      const microcycle = await microcycleService.createMicrocycle({
        clientId: userId,
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
        `[TrainingService] Created microcycle for user ${userId}, week ${progress.absoluteWeek} (${progress.weekStartDate.toISOString()} - ${progress.weekEndDate.toISOString()})`
      );

      return { microcycle, progress: { ...progress, microcycle }, wasCreated: true };
    },
  };
}
