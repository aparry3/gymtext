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
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

const useAgentRunner = () => process.env.USE_AGENT_RUNNER === 'true';

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

      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // V2: Use agent-runner if enabled
      if (useAgentRunner()) {
        console.log('[Inngest] Using agent-runner V2 for weekly message');
        const { getRunner } = await import('@/server/agent-runner/runner');
        const { createNewWeeklyMessageService } = await import('@/server/agent-runner/services/newWeeklyMessageService');
        const newWeekly = createNewWeeklyMessageService({ runner: getRunner() });
        const timezone = user.timezone || 'America/New_York';
        const weeklyResult = await newWeekly.generateWeeklyMessage(user.id, timezone);

        if (!weeklyResult.success || !weeklyResult.message) {
          return { success: false, error: weeklyResult.error || 'No weekly message generated', messageIds: [] };
        }

        const sendResult = await services.messagingOrchestrator.sendImmediate(user, weeklyResult.message);
        return { success: true, messageIds: [sendResult.messageId].filter(Boolean) };
      }

      // V1: Legacy path
      const messageResult = await services.weeklyMessage.sendWeeklyMessage(user);

      console.log('[Inngest] Weekly message sent:', {
        userId,
        success: messageResult.success,
        messageIds: messageResult.messageIds,
      });

      return messageResult;
    });

    if (!result.success) {
      throw new Error(`Failed to send weekly message: ${'error' in result ? result.error : 'Unknown error'}`);
    }

    return {
      success: true,
      userId,
      messageIds: 'messageIds' in result ? result.messageIds : [],
    };
  }
);
