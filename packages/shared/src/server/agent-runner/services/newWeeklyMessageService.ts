/**
 * New Weekly Message Service (V2)
 *
 * Generates weekly preview/check-in messages using agent-runner.
 * Updates fitness context, gets upcoming week workout, formats for SMS.
 */
import type { Runner } from '@agent-runner/core';
import { fitnessContextId, chatSessionId, appendMessageToSession } from '../helpers';

export interface WeeklyMessageResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NewWeeklyMessageServiceInstance {
  generateWeeklyMessage(userId: string, timezone?: string): Promise<WeeklyMessageResult>;
}

export interface NewWeeklyMessageServiceDeps {
  runner: Runner;
}

export function createNewWeeklyMessageService(deps: NewWeeklyMessageServiceDeps): NewWeeklyMessageServiceInstance {
  const { runner } = deps;

  return {
    async generateWeeklyMessage(userId: string, timezone = 'America/New_York'): Promise<WeeklyMessageResult> {
      const contextId = fitnessContextId(userId);

      try {
        console.log('[NewWeeklyMessageService] Generating weekly message for user:', userId);

        // Step 1: Refresh fitness context (update current week schedule)
        await runner.invoke('update-fitness', 'Generate the upcoming week\'s training schedule based on the current plan and progression.', {
          contextIds: [contextId],
        });

        // Step 2: Get a preview workout for the week
        const workoutResult = await runner.invoke('get-workout', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timezone,
          weekPreview: true,
        }), {
          contextIds: [contextId],
        });

        // Step 3: Format as weekly summary message
        const formatResult = await runner.invoke('format-workout', JSON.stringify({
          type: 'weekly-preview',
          workout: workoutResult.output,
        }));

        let message: string;
        try {
          const parsed = JSON.parse(formatResult.output);
          message = parsed.message;
        } catch {
          message = formatResult.output;
        }

        // Inject into chat session
        await appendMessageToSession(runner, chatSessionId(userId), {
          role: 'assistant',
          content: message,
        });

        return { success: true, message };
      } catch (error) {
        console.error('[NewWeeklyMessageService] Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
