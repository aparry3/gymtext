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
import { createServicesFromDb } from '@/server/services';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { getRunner } from '@/server/agent-runner/runner';
import { createNewDailyWorkoutService } from '@/server/agent-runner/services/newDailyWorkoutService';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);

const useAgentRunner = () => process.env.USE_AGENT_RUNNER === 'true';

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
    const result = await step.run('send-daily-workout', async () => {
      console.log('[Inngest] Sending daily workout:', { userId, targetDate });

      const user = await services.user.getUser(userId);

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // V2: Use agent-runner if enabled
      if (useAgentRunner()) {
        console.log('[Inngest] Using agent-runner V2 for daily workout');
        const newDailyWorkout = createNewDailyWorkoutService({ runner: getRunner() });
        const timezone = user.timezone || 'America/New_York';
        const workoutResult = await newDailyWorkout.generateDailyWorkout(user.id, timezone);

        if (!workoutResult.success || !workoutResult.message) {
          return { success: false, error: workoutResult.error || 'No workout generated' };
        }

        // Send the message via messaging orchestrator
        const sendResult = await services.messagingOrchestrator.sendImmediate(user, workoutResult.message);
        console.log('[Inngest] V2 daily workout sent:', { userId, messageId: sendResult.messageId });

        return {
          success: true,
          messageId: sendResult.messageId,
          isRestDay: workoutResult.isRestDay,
        };
      }

      // V1: Legacy path
      const messageResult = await services.dailyMessage.sendDailyMessage(user);

      console.log('[Inngest] Daily workout sent:', {
        userId,
        success: messageResult.success,
        messageId: messageResult.messageId,
      });

      return messageResult;
    });

    if (!result.success) {
      throw new Error(`Failed to send daily workout: ${'error' in result ? result.error : 'Unknown error'}`);
    }

    return {
      success: true,
      userId,
      messageId: 'messageId' in result ? result.messageId : undefined,
      targetDate,
    };
  }
);
