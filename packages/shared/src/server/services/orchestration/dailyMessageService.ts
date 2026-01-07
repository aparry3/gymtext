import { UserWithProfile } from '@/server/models/user';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import { getUrlsConfig } from '@/shared/config';
import { createWorkoutAgentService, type WorkoutAgentService } from '../agents/training';
import type { RepositoryContainer } from '../../repositories/factory';
import type { UserServiceInstance } from '../user/userService';
import type { WorkoutInstanceServiceInstance } from '../training/workoutInstanceService';
import type { MessageQueueServiceInstance, QueuedMessage } from '../messaging/messageQueueService';
import type { DayConfigServiceInstance } from '../calendar/dayConfigService';
import type { ContextService } from '../context/contextService';

interface MessageResult {
  success: boolean;
  userId: string;
  error?: string;
  messageId?: string;
}

interface SchedulingResult {
  scheduled: number;
  failed: number;
  duration: number;
  errors: Array<{ userId: string; error: string }>;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * DailyMessageServiceInstance interface
 *
 * Defines all public methods available on the daily message service.
 */
export interface DailyMessageServiceInstance {
  scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult>;
  sendDailyMessage(user: UserWithProfile): Promise<MessageResult>;
  getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null>;
  generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutInstance | null>;
}

export interface DailyMessageServiceDeps {
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  messageQueue: MessageQueueServiceInstance;
  dayConfig: DayConfigServiceInstance;
  contextService: ContextService;
}

/**
 * Create a DailyMessageService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @param deps - Service dependencies
 * @returns DailyMessageServiceInstance
 */
export function createDailyMessageService(
  repos: RepositoryContainer,
  deps: DailyMessageServiceDeps
): DailyMessageServiceInstance {
  const { user: userService, workoutInstance: workoutInstanceService, messageQueue: messageQueueService, dayConfig: dayConfigService, contextService } = deps;
  let workoutAgent: WorkoutAgentService | null = null;

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) {
      workoutAgent = createWorkoutAgentService(contextService);
    }
    return workoutAgent;
  };

  return {
    async scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult> {
      const startTime = Date.now();
      const errors: Array<{ userId: string; error: string }> = [];
      let scheduled = 0;
      let failed = 0;

      try {
        const candidateUsers = await userService.getUsersForHour(utcHour);
        console.log(`[DailyMessageService] Found ${candidateUsers.length} candidate users for hour ${utcHour}`);

        if (candidateUsers.length === 0) {
          return { scheduled: 0, failed: 0, duration: Date.now() - startTime, errors: [] };
        }

        const userDatePairs = candidateUsers.map(user => {
          const todayStart = now(user.timezone).startOf('day').toJSDate();
          const todayEnd = now(user.timezone).startOf('day').plus({ days: 1 }).toJSDate();
          return { userId: user.id, startOfDay: todayStart, endOfDay: todayEnd };
        });

        const userIdsWithWorkouts = await repos.workoutInstance.findUserIdsWithWorkoutsForUserDates(userDatePairs);
        const usersToSchedule = candidateUsers.filter(u => !userIdsWithWorkouts.has(u.id));

        console.log(`[DailyMessageService] ${userIdsWithWorkouts.size} users already have workouts, scheduling ${usersToSchedule.length} users`);

        if (usersToSchedule.length === 0) {
          return { scheduled: 0, failed: 0, duration: Date.now() - startTime, errors: [] };
        }

        const events = usersToSchedule.map(user => ({
          name: 'workout/scheduled' as const,
          data: {
            userId: user.id,
            targetDate: now(user.timezone).startOf('day').toISO(),
          },
        }));

        try {
          const { ids } = await inngest.send(events);
          scheduled = ids.length;
          console.log(`[DailyMessageService] Scheduled ${scheduled} Inngest jobs`);
        } catch (error) {
          console.error('[DailyMessageService] Failed to schedule Inngest jobs:', error);
          failed = events.length;
          errors.push({
            userId: 'batch',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        return { scheduled, failed, duration: Date.now() - startTime, errors };
      } catch (error) {
        console.error('[DailyMessageService] Error scheduling messages:', error);
        throw error;
      }
    },

    async sendDailyMessage(user: UserWithProfile): Promise<MessageResult> {
      try {
        console.log(`Processing daily message for user ${user.id}`);

        const targetDate = now(user.timezone).startOf('day');
        let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());

        if (!workout) {
          console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
          workout = await workoutInstanceService.generateWorkoutForDate(user, targetDate);

          if (!workout) {
            console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
            return { success: false, userId: user.id, error: 'Could not generate workout for today' };
          }
        }

        let workoutMessage: string;
        if ('message' in workout && workout.message) {
          workoutMessage = workout.message;
        } else if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
          const messageAgent = await getWorkoutAgent().getMessageAgent();
          const result = await messageAgent.invoke(workout.description);
          workoutMessage = result.response;
        } else {
          throw new Error('Workout missing required fields for message generation');
        }

        const customImageUrl = await dayConfigService.getImageUrlForDate(targetDate.toJSDate());

        let mediaUrls: string[] | undefined;
        if (customImageUrl) {
          mediaUrls = [customImageUrl];
          console.log(`Using custom day image for ${targetDate.toISODate()}`);
        } else {
          const { publicBaseUrl, baseUrl } = getUrlsConfig();
          const resolvedBaseUrl = publicBaseUrl || baseUrl;
          mediaUrls = resolvedBaseUrl ? [`${resolvedBaseUrl}/OpenGraphGymtext.png`] : undefined;

          if (!resolvedBaseUrl) {
            console.warn('BASE_URL not configured - sending workout without logo image');
          }
        }

        const queuedMessages: QueuedMessage[] = [{ content: workoutMessage, mediaUrls }];

        await messageQueueService.enqueueMessages(user.id, queuedMessages, 'daily');
        console.log(`Successfully queued daily messages for user ${user.id}`);

        return { success: true, userId: user.id, messageId: undefined };
      } catch (error) {
        console.error(`Error sending daily message to user ${user.id}:`, error);
        return { success: false, userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    async getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null> {
      const workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
      console.log(`Workout: ${workout}`);
      return workout || null;
    },

    async generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutInstance | null> {
      return workoutInstanceService.generateWorkoutForDate(user, targetDate);
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { MessageService } from '../messaging/messageService';
import { UserService } from '../user/userService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { messageQueueService as deprecatedMessageQueueService } from '../messaging/messageQueueService';
import { dayConfigService as deprecatedDayConfigService } from '../calendar/dayConfigService';
import { createContextService } from '../context';

/**
 * @deprecated Use createDailyMessageService(repos, deps) instead
 */
export class DailyMessageService {
  private static instance: DailyMessageService;
  private userService: UserService;
  private workoutInstanceService: WorkoutInstanceService;
  private workoutInstanceRepository: WorkoutInstanceRepository;
  private messageService: MessageService;
  private batchSize: number;
  private _workoutAgent: WorkoutAgentService | null = null;

  private constructor(batchSize: number = 10) {
    this.userService = UserService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
    this.workoutInstanceRepository = new WorkoutInstanceRepository();
    this.messageService = MessageService.getInstance();
    this.batchSize = batchSize;
  }

  public static getInstance(batchSize: number = 10): DailyMessageService {
    if (!DailyMessageService.instance) {
      DailyMessageService.instance = new DailyMessageService(batchSize);
    }
    return DailyMessageService.instance;
  }

  private getWorkoutAgent(): WorkoutAgentService {
    if (!this._workoutAgent) {
      // Use require to avoid circular dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const services = require('@/server/services');
      const contextService = createContextService({
        fitnessPlanService: services.fitnessPlanService,
        workoutInstanceService: services.workoutInstanceService,
        microcycleService: services.microcycleService,
        fitnessProfileService: services.fitnessProfileService,
      });
      this._workoutAgent = createWorkoutAgentService(contextService);
    }
    return this._workoutAgent;
  }

  /**
   * Schedules daily messages for all users in a given UTC hour
   * Returns metrics about the scheduling operation
   *
   * This method uses catch-up logic: it schedules messages for users whose
   * preferred send hour has already passed today AND who haven't received
   * their workout message yet (no workout instance exists for today).
   */
  public async scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult> {
    const startTime = Date.now();
    const errors: Array<{ userId: string; error: string }> = [];
    let scheduled = 0;
    let failed = 0;

    try {
      // Get candidate users (those whose local hour >= preferredSendHour)
      const candidateUsers = await this.userService.getUsersForHour(utcHour);
      console.log(`[DailyMessageService] Found ${candidateUsers.length} candidate users for hour ${utcHour}`);

      if (candidateUsers.length === 0) {
        return {
          scheduled: 0,
          failed: 0,
          duration: Date.now() - startTime,
          errors: []
        };
      }

      // Build user-specific date ranges (each user's "today" based on their timezone)
      const userDatePairs = candidateUsers.map(user => {
        const todayStart = now(user.timezone).startOf('day').toJSDate();
        const todayEnd = now(user.timezone).startOf('day').plus({ days: 1 }).toJSDate();
        return { userId: user.id, startOfDay: todayStart, endOfDay: todayEnd };
      });

      // Batch-check which users already have workouts for their "today"
      const userIdsWithWorkouts = await this.workoutInstanceRepository
        .findUserIdsWithWorkoutsForUserDates(userDatePairs);

      // Filter to only users WITHOUT workouts (they haven't been sent yet)
      const usersToSchedule = candidateUsers.filter(
        u => !userIdsWithWorkouts.has(u.id)
      );

      console.log(`[DailyMessageService] ${userIdsWithWorkouts.size} users already have workouts, scheduling ${usersToSchedule.length} users`);

      if (usersToSchedule.length === 0) {
        return {
          scheduled: 0,
          failed: 0,
          duration: Date.now() - startTime,
          errors: []
        };
      }

      // Map users to Inngest events
      const events = usersToSchedule.map(user => {
        // Get target date in user's timezone (today at start of day)
        const targetDate = now(user.timezone)
          .startOf('day')
          .toISO();

        return {
          name: 'workout/scheduled' as const,
          data: {
            userId: user.id,
            targetDate,
          },
        };
      });

      // Send all events to Inngest in batch
      try {
        const { ids } = await inngest.send(events);
        scheduled = ids.length;
        console.log(`[DailyMessageService] Scheduled ${scheduled} Inngest jobs`);
      } catch (error) {
        console.error('[DailyMessageService] Failed to schedule Inngest jobs:', error);
        failed = events.length;
        errors.push({
          userId: 'batch',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      return {
        scheduled,
        failed,
        duration: Date.now() - startTime,
        errors
      };
    } catch (error) {
      console.error('[DailyMessageService] Error scheduling messages:', error);
      throw error;
    }
  }

  /**
   * Sends a daily message to a single user
   */
  public async sendDailyMessage(
    user: UserWithProfile
  ): Promise<MessageResult> {
    try {
      console.log(`Processing daily message for user ${user.id}`);

      // Get today's date in the user's timezone
      const targetDate = now(user.timezone).startOf('day');

      // First try to get existing workout
      let workout = await this.getTodaysWorkout(user.id, targetDate.toJSDate());

      // If no workout exists, generate it on-demand
      if (!workout) {
        console.log(`No workout found for user ${user.id} on ${targetDate.toISODate()}, generating on-demand`);
        workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);

        if (!workout) {
          console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
          return {
            success: false,
            userId: user.id,
            error: 'Could not generate workout for today'
          };
        }
      }

      // Extract message content (either pre-generated or need to generate)
      let workoutMessage: string;
      if ('message' in workout && workout.message) {
        workoutMessage = workout.message;
      } else if ('description' in workout && 'reasoning' in workout && workout.description && workout.reasoning) {
        // Fallback: Generate message if needed (shouldn't happen in production)
        const messageAgent = await this.getWorkoutAgent().getMessageAgent();
        const result = await messageAgent.invoke(workout.description);
        workoutMessage = result.response;
      } else {
        throw new Error('Workout missing required fields for message generation');
      }

      // Send single message with both image and text
      // Check for day-specific custom image first
      const customImageUrl = await deprecatedDayConfigService.getImageUrlForDate(targetDate.toJSDate());

      let mediaUrls: string[] | undefined;
      if (customImageUrl) {
        // Use day-specific custom image (e.g., holiday themed)
        mediaUrls = [customImageUrl];
        console.log(`Using custom day image for ${targetDate.toISODate()}`);
      } else {
        // Fall back to default logo
        const { publicBaseUrl, baseUrl } = getUrlsConfig();
        const resolvedBaseUrl = publicBaseUrl || baseUrl;
        mediaUrls = resolvedBaseUrl ? [`${resolvedBaseUrl}/OpenGraphGymtext.png`] : undefined;

        if (!resolvedBaseUrl) {
          console.warn('BASE_URL not configured - sending workout without logo image');
        }
      }

      const queuedMessages: QueuedMessage[] = [{
        content: workoutMessage,
        mediaUrls
      }];

      await deprecatedMessageQueueService.enqueueMessages(user.id, queuedMessages, 'daily');
      console.log(`Successfully queued daily messages for user ${user.id}`);

      return {
        success: true,
        userId: user.id,
        messageId: undefined // Messages will be sent asynchronously by queue
      };
    } catch (error) {
      console.error(`Error sending daily message to user ${user.id}:`, error);
      return {
        success: false,
        userId: user.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Gets today's workout for a user
   */
  public async getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null> {
    // The date passed in is already the correct date at midnight in the user's timezone
    // We can use it directly for the query
    const workout = await this.workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
    console.log(`Workout: ${workout}`);
    return workout || null;
  }

  /**
   * Generates a workout for a specific date (wrapper for onboarding)
   * Delegates to WorkoutInstanceService for business logic
   */
  public async generateWorkout(
    user: UserWithProfile,
    targetDate: DateTime
  ): Promise<WorkoutInstance | null> {
    return this.workoutInstanceService.generateWorkoutForDate(user, targetDate);
  }
}

// Export singleton instance
export const dailyMessageService = DailyMessageService.getInstance();