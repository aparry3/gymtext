import { UserWithProfile } from '@/server/models/user';
import { inngest } from '@/server/connections/inngest/client';
import { now, getNextWeekStart } from '@/shared/utils/date';
import { getUrlsConfig } from '@/shared/config';
import type { UserServiceInstance } from '../domain/user/userService';
import type { FitnessPlanServiceInstance } from '../domain/training/fitnessPlanService';
import type { TrainingServiceInstance } from './trainingService';
import type { MessagingOrchestratorInstance, QueuedMessageContent } from './messagingOrchestrator';
import type { MessagingAgentServiceInstance } from '../agents/messaging/messagingAgentService';
import type { EnrollmentServiceInstance } from '../domain/program/enrollmentService';
import type { DayConfigServiceInstance } from '../domain/calendar/dayConfigService';

interface MessageResult {
  success: boolean;
  userId: string;
  error?: string;
  messageIds?: string[];
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
 * WeeklyMessageServiceInstance interface
 *
 * Defines all public methods available on the weekly message service.
 */
export interface WeeklyMessageServiceInstance {
  scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult>;
  sendWeeklyMessage(user: UserWithProfile): Promise<MessageResult>;
  triggerForUser(userId: string, options: TriggerOptions): Promise<TriggerResult>;
  checkUserEligibility(userId: string): Promise<EligibilityResult>;
}

export interface WeeklyMessageServiceDeps {
  user: UserServiceInstance;
  messagingOrchestrator: MessagingOrchestratorInstance;
  training: TrainingServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  messagingAgent: MessagingAgentServiceInstance;
  enrollment: EnrollmentServiceInstance;
  dayConfig: DayConfigServiceInstance;
}

/**
 * Create a WeeklyMessageService instance with injected dependencies
 *
 * @param deps - Service dependencies
 * @returns WeeklyMessageServiceInstance
 */
export function createWeeklyMessageService(
  deps: WeeklyMessageServiceDeps
): WeeklyMessageServiceInstance {
  const {
    user: userService,
    messagingOrchestrator,
    training: trainingService,
    messagingAgent: messagingAgentService,
    enrollment: enrollmentService,
    dayConfig: dayConfigService,
  } = deps;

  return {
    async scheduleMessagesForHour(utcHour: number): Promise<SchedulingResult> {
      const startTime = Date.now();
      const errors: Array<{ userId: string; error: string }> = [];
      let scheduled = 0;
      let failed = 0;

      try {
        const users = await userService.getUsersForWeeklyMessage(utcHour);
        console.log(`[WeeklyMessageService] Found ${users.length} users to schedule for hour ${utcHour} on Sunday`);

        if (users.length === 0) {
          return { scheduled: 0, failed: 0, duration: Date.now() - startTime, errors: [] };
        }

        const events = users.map(user => ({
          name: 'weekly/scheduled' as const,
          data: { userId: user.id },
        }));

        try {
          const { ids } = await inngest.send(events);
          scheduled = ids.length;
          console.log(`[WeeklyMessageService] Scheduled ${scheduled} Inngest jobs`);
        } catch (error) {
          console.error('[WeeklyMessageService] Failed to schedule Inngest jobs:', error);
          failed = events.length;
          errors.push({
            userId: 'batch',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }

        return { scheduled, failed, duration: Date.now() - startTime, errors };
      } catch (error) {
        console.error('[WeeklyMessageService] Error scheduling messages:', error);
        throw error;
      }
    },

    async sendWeeklyMessage(user: UserWithProfile): Promise<MessageResult> {
      try {
        console.log(`[WeeklyMessageService] Processing weekly message for user ${user.id}`);

        // Get enrollment and current fitness plan instance
        const enrollmentResult = await enrollmentService.getEnrollmentWithProgramVersion(user.id);
        if (!enrollmentResult) {
          console.error(`[WeeklyMessageService] No active enrollment found for user ${user.id}`);
          return { success: false, userId: user.id, error: 'No active enrollment found' };
        }

        const { currentPlanInstance: plan } = enrollmentResult;
        if (!plan) {
          console.error(`[WeeklyMessageService] No fitness plan version found for user ${user.id}`);
          return { success: false, userId: user.id, error: 'No fitness plan found' };
        }

        const currentDate = now(user.timezone).toJSDate();
        const nextSundayDate = getNextWeekStart(currentDate, user.timezone);

        console.log(`[WeeklyMessageService] Getting next week's plan for ${nextSundayDate.toISOString()} for user ${user.id}`);

        let nextWeekMicrocycle;
        try {
          const result = await trainingService.prepareMicrocycleForDate(
            user.id, plan, nextSundayDate, user.timezone
          );
          nextWeekMicrocycle = result.microcycle;
        } catch (error) {
          console.error(`[WeeklyMessageService] Failed to get/create next week's microcycle for user ${user.id}:`, error);
          return { success: false, userId: user.id, error: 'Could not generate next week\'s training pattern' };
        }

        if (!nextWeekMicrocycle) {
          console.error(`[WeeklyMessageService] Failed to get/create next week's microcycle for user ${user.id}`);
          return { success: false, userId: user.id, error: 'Could not generate next week\'s training pattern' };
        }

        const breakdownMessage = nextWeekMicrocycle.message;
        if (!breakdownMessage) {
          console.error(`[WeeklyMessageService] No breakdown message stored for microcycle ${nextWeekMicrocycle.id}`);
          return { success: false, userId: user.id, error: 'No breakdown message found for next week\'s microcycle' };
        }

        // Get image URL (custom or default)
        const customImageUrl = await dayConfigService.getImageUrlForDate(nextSundayDate);

        let mediaUrls: string[] | undefined;
        if (customImageUrl) {
          mediaUrls = [customImageUrl];
          console.log(`[WeeklyMessageService] Using custom day image for ${nextSundayDate.toISOString()}`);
        } else {
          const { publicBaseUrl, baseUrl } = getUrlsConfig();
          const resolvedBaseUrl = publicBaseUrl || baseUrl;
          mediaUrls = resolvedBaseUrl ? [`${resolvedBaseUrl}/OpenGraphGymtext.png`] : undefined;

          if (!resolvedBaseUrl) {
            console.warn('[WeeklyMessageService] BASE_URL not configured - sending weekly message without logo image');
          }
        }

        const queuedMessages: QueuedMessageContent[] = [{ content: breakdownMessage, mediaUrls }];

        // Queue the message instead of sending immediately
        const result = await messagingOrchestrator.queueMessages(user, queuedMessages, 'weekly');
        console.log(`[WeeklyMessageService] Queued weekly message for user ${user.id}`);

        console.log(`[WeeklyMessageService] Successfully queued weekly message for user ${user.id}`);
        return { success: true, userId: user.id, messageIds: result.messageIds };
      } catch (error) {
        console.error(`[WeeklyMessageService] Error sending weekly message to user ${user.id}:`, error);
        return { success: false, userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
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
        const dayOfWeek = userNow.weekday; // 1 = Monday, 7 = Sunday

        // Weekly messages are sent at 5pm on Sundays
        const targetHour = 17; // 5pm
        const targetDay = 7; // Sunday

        if (dayOfWeek !== targetDay) {
          return {
            eligible: false,
            reason: `Today is not Sunday (current day: ${userNow.weekdayLong})`,
          };
        }

        if (localHour < targetHour) {
          return {
            eligible: false,
            reason: `Current local time (${localHour}:00) is before target send hour (${targetHour}:00)`,
          };
        }

        return { eligible: true, reason: 'User is eligible for weekly message' };
      } catch (error) {
        console.error(`[WeeklyMessageService] Error checking eligibility for user ${userId}:`, error);
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
        const { ids } = await inngest.send({
          name: 'weekly/scheduled',
          data: { userId },
        });

        console.log(`[WeeklyMessageService] Triggered weekly message for user ${userId}, event ID: ${ids[0]}`);

        return {
          success: true,
          scheduled: true,
          inngestEventId: ids[0],
          reason: options.forceImmediate ? 'Force triggered' : 'Eligible and triggered',
        };
      } catch (error) {
        console.error(`[WeeklyMessageService] Error triggering for user ${userId}:`, error);
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
