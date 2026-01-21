import { UserWithProfile } from '@/server/models/user';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import { getUrlsConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../repositories/factory';
import type { UserServiceInstance } from '../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../domain/training/workoutInstanceService';
import type { MessagingOrchestratorInstance, QueuedMessageContent } from './messagingOrchestrator';
import type { DayConfigServiceInstance } from '../domain/calendar/dayConfigService';
import type { TrainingServiceInstance } from './trainingService';

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
  messagingOrchestrator: MessagingOrchestratorInstance;
  dayConfig: DayConfigServiceInstance;
  training: TrainingServiceInstance;
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
  const {
    user: userService,
    workoutInstance: workoutInstanceService,
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

    async getTodaysWorkout(userId: string, date: Date): Promise<WorkoutInstance | null> {
      const workout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, date);
      console.log(`Workout: ${workout}`);
      return workout || null;
    },

    async generateWorkout(user: UserWithProfile, targetDate: DateTime): Promise<WorkoutInstance | null> {
      return trainingService.prepareWorkoutForDate(user, targetDate);
    },
  };
}

// =============================================================================
