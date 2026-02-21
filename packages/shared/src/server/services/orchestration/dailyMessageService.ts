import { UserWithProfile } from '@/server/models/user';
import { DateTime } from 'luxon';
import { now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import { getUrlsConfig } from '@/shared/config';
import type { UserServiceInstance } from '../domain/user/userService';
import type { MessagingOrchestratorInstance, QueuedMessageContent } from './messagingOrchestrator';
import type { DayConfigServiceInstance } from '../domain/calendar/dayConfigService';
import type { TrainingServiceInstance, WorkoutData } from './trainingService';

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

export interface TriggerOptions {
  forceImmediate: boolean;
}

export interface TriggerResult {
  success: boolean;
  scheduled: boolean;
  reason?: string;
  inngestEventId?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
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
  getTodaysWorkout(userId: string, date: Date): Promise<WorkoutData | null>;
  generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutData | null>;
  triggerForUser(userId: string, options: TriggerOptions): Promise<TriggerResult>;
  checkUserEligibility(userId: string): Promise<EligibilityResult>;
}

export interface DailyMessageServiceDeps {
  user: UserServiceInstance;
  messagingOrchestrator: MessagingOrchestratorInstance;
  dayConfig: DayConfigServiceInstance;
  training: TrainingServiceInstance;
}

/**
 * Create a DailyMessageService instance with injected dependencies
 *
 * @param deps - Service dependencies
 * @returns DailyMessageServiceInstance
 */
export function createDailyMessageService(
  deps: DailyMessageServiceDeps
): DailyMessageServiceInstance {
  const {
    user: userService,
    messagingOrchestrator,
    dayConfig: dayConfigService,
    training: trainingService,
  } = deps;

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

        const usersToSchedule = candidateUsers;

        console.log(`[DailyMessageService] Scheduling ${usersToSchedule.length} users`);

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
          workout = await trainingService.prepareWorkoutForDate(user, targetDate);

          if (!workout) {
            console.log(`Failed to generate workout for user ${user.id} on ${targetDate.toISODate()}`);
            return { success: false, userId: user.id, error: 'Could not generate workout for today' };
          }
        }

        let workoutMessage: string;
        if ('message' in workout && workout.message) {
          workoutMessage = workout.message;
        } else if ('description' in workout && workout.description) {
          // Use trainingService to regenerate message with proper day format context
          workoutMessage = await trainingService.regenerateWorkoutMessage(user, workout);
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

        const queuedMessages: QueuedMessageContent[] = [{ content: workoutMessage, mediaUrls }];

        // Use messagingOrchestrator instead of messageQueueService
        const result = await messagingOrchestrator.queueMessages(user, queuedMessages, 'daily');
        console.log(`Successfully queued daily messages for user ${user.id}`);

        return { success: true, userId: user.id, messageId: result.messageIds[0] };
      } catch (error) {
        console.error(`Error sending daily message to user ${user.id}:`, error);
        return { success: false, userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    async getTodaysWorkout(_userId: string, _date: Date): Promise<WorkoutData | null> {
      // Workouts are now generated on-demand, no stored instances to look up
      return null;
    },

    async generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutData | null> {
      return trainingService.prepareWorkoutForDate(user, targetDate);
    },

    async checkUserEligibility(userId: string): Promise<EligibilityResult> {
      try {
        const user = await userService.getUser(userId);
        if (!user) {
          return { eligible: false, reason: 'User not found' };
        }

        // Get user's current local time
        const userNow = now(user.timezone);
        const localHour = userNow.hour;

        // Check if current local time >= preferred send hour
        if (localHour < user.preferredSendHour) {
          return {
            eligible: false,
            reason: `Current local time (${localHour}:00) is before preferred send hour (${user.preferredSendHour}:00)`,
          };
        }

        return { eligible: true, reason: 'User is eligible for daily message' };
      } catch (error) {
        console.error(`[DailyMessageService] Error checking eligibility for user ${userId}:`, error);
        return { eligible: false, reason: error instanceof Error ? error.message : 'Unknown error' };
      }
    },

    async triggerForUser(userId: string, options: TriggerOptions): Promise<TriggerResult> {
      try {
        const user = await userService.getUser(userId);
        if (!user) {
          return { success: false, scheduled: false, reason: 'User not found' };
        }

        // If not forcing immediate, check eligibility
        if (!options.forceImmediate) {
          const eligibility = await this.checkUserEligibility(userId);
          if (!eligibility.eligible) {
            return { success: true, scheduled: false, reason: eligibility.reason };
          }
        }

        // Schedule the Inngest event
        const targetDate = now(user.timezone).startOf('day').toISO();
        const { ids } = await inngest.send({
          name: 'workout/scheduled',
          data: { userId, targetDate },
        });

        console.log(`[DailyMessageService] Triggered daily message for user ${userId}, event ID: ${ids[0]}`);

        return {
          success: true,
          scheduled: true,
          inngestEventId: ids[0],
          reason: options.forceImmediate ? 'Force triggered' : 'Eligible and triggered',
        };
      } catch (error) {
        console.error(`[DailyMessageService] Error triggering for user ${userId}:`, error);
        return {
          success: false,
          scheduled: false,
          reason: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
  };
}

// =============================================================================
