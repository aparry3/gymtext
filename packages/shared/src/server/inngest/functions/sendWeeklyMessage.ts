/**
 * Send Weekly Message Function (Inngest)
 *
 * Async function that sends weekly check-in messages to users.
 * Triggered by the 'weekly/scheduled' event from the cron job.
 *
 * Flow:
 * 1. Load user with profile
 * 2. Advance user's progress to next week
 * 3. Generate next week's microcycle pattern
 * 4. Generate and send messages via WeeklyMessageService
 *
 * Benefits:
 * - Runs async (doesn't block cron)
 * - Automatic retries on failure (3 attempts)
 * - Step-by-step execution tracking
 * - Individual user isolation (one failure doesn't affect others)
 */

import { inngest } from '@/server/connections/inngest/client';
import { weeklyMessageService } from '@/server/services';
import { userService } from '@/server/services/user/userService';

export const sendWeeklyMessageFunction = inngest.createFunction(
  {
    id: 'send-weekly-message',
    name: 'Send Weekly Check-in Message',
    retries: 3, // Retry up to 3 times on failure
  },
  { event: 'weekly/scheduled' },
  async ({ event, step }) => {
    const { userId } = event.data;

    // Step 1: Load user and send weekly message
    // This includes:
    // - Advancing progress to next week
    // - Generating next week's microcycle
    // - Generating and sending both messages
    const result = await step.run('send-weekly-message', async () => {
      console.log('[Inngest] Sending weekly message:', { userId });

      const user = await userService.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Use the WeeklyMessageService which handles:
      // 1. Advancing to next week
      // 2. Getting/creating next week's microcycle
      // 3. Checking for mesocycle transitions
      // 4. Generating messages with AI
      // 5. Sending both messages
      const messageResult = await weeklyMessageService.sendWeeklyMessage(user);

      console.log('[Inngest] Weekly message sent:', {
        userId,
        success: messageResult.success,
        messageIds: messageResult.messageIds,
      });

      return messageResult;
    });

    if (!result.success) {
      throw new Error(`Failed to send weekly message: ${result.error}`);
    }

    return {
      success: true,
      userId,
      messageIds: result.messageIds,
    };
  }
);
