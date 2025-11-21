/**
 * Send Daily Workout Function (Inngest)
 *
 * Async function that generates and sends daily workout messages to users.
 * Triggered by the 'workout/scheduled' event from the cron job.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Generate workout (if needed) and message via DailyMessageService
 * 3. Send message via MessageService
 *
 * Benefits:
 * - Runs async (doesn't block cron)
 * - Automatic retries on failure (3 attempts)
 * - Step-by-step execution tracking
 * - Individual user isolation (one failure doesn't affect others)
 */

import { inngest } from '@/server/connections/inngest/client';
import { dailyMessageService } from '@/server/services';
import { userService } from '@/server/services/user/userService';

export const sendDailyWorkoutFunction = inngest.createFunction(
  {
    id: 'send-daily-workout',
    name: 'Send Daily Workout Message',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'workout/scheduled' },
  async ({ event, step }) => {
    const { userId, targetDate } = event.data;

    // Step 1: Load user and send daily message
    // This includes workout generation (if needed) and message sending
    const result = await step.run('send-daily-workout', async () => {
      console.log('[Inngest] Sending daily workout:', { userId, targetDate });

      const user = await userService.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Use the existing DailyMessageService which handles:
      // 1. Getting or generating today's workout
      // 2. Generating the message
      // 3. Sending via MessageService
      const messageResult = await dailyMessageService.sendDailyMessage(user);

      console.log('[Inngest] Daily workout sent:', {
        userId,
        success: messageResult.success,
        messageId: messageResult.messageId,
      });

      return messageResult;
    });

    if (!result.success) {
      throw new Error(`Failed to send daily workout: ${result.error}`);
    }

    return {
      success: true,
      userId,
      messageId: result.messageId,
      targetDate,
    };
  }
);
