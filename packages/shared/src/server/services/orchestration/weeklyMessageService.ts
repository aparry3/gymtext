import { UserWithProfile } from '@/server/models/user';
import { inngest } from '@/server/connections/inngest/client';
import { now, getNextWeekStart } from '@/shared/utils/date';
import type { UserServiceInstance } from '../user/userService';
import type { MessageServiceInstance } from '../messaging/messageService';
import type { FitnessPlanServiceInstance } from '../training/fitnessPlanService';
import type { TrainingServiceInstance } from './trainingService';
import type { MessagingAgentServiceInstance } from '../agents/messaging/messagingAgentService';

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
}

export interface WeeklyMessageServiceDeps {
  user: UserServiceInstance;
  message: MessageServiceInstance;
  training: TrainingServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  messagingAgent: MessagingAgentServiceInstance;
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
    message: messageService,
    training: trainingService,
    fitnessPlan: fitnessPlanService,
    messagingAgent: messagingAgentService,
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

        const plan = await fitnessPlanService.getCurrentPlan(user.id);
        if (!plan) {
          console.error(`[WeeklyMessageService] No fitness plan found for user ${user.id}`);
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

        const isDeload = nextWeekMicrocycle.isDeload;
        if (isDeload) {
          console.log(`[WeeklyMessageService] User ${user.id} is entering a deload week (week ${nextWeekMicrocycle.absoluteWeek})`);
        }

        const feedbackMessage = await messagingAgentService.generateWeeklyMessage(
          user, isDeload, nextWeekMicrocycle.absoluteWeek
        );

        const breakdownMessage = nextWeekMicrocycle.message;
        if (!breakdownMessage) {
          console.error(`[WeeklyMessageService] No breakdown message stored for microcycle ${nextWeekMicrocycle.id}`);
          return { success: false, userId: user.id, error: 'No breakdown message found for next week\'s microcycle' };
        }

        const messageIds: string[] = [];

        const feedbackMsg = await messageService.sendMessage(user, feedbackMessage);
        messageIds.push(feedbackMsg.id);
        console.log(`[WeeklyMessageService] Sent feedback message to user ${user.id}`);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const breakdownMsg = await messageService.sendMessage(user, breakdownMessage);
        messageIds.push(breakdownMsg.id);
        console.log(`[WeeklyMessageService] Sent breakdown message to user ${user.id}`);

        console.log(`[WeeklyMessageService] Successfully sent weekly messages to user ${user.id}`);
        return { success: true, userId: user.id, messageIds };
      } catch (error) {
        console.error(`[WeeklyMessageService] Error sending weekly message to user ${user.id}:`, error);
        return { success: false, userId: user.id, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
  };
}

// =============================================================================
