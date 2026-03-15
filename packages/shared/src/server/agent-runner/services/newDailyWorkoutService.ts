/**
 * New Daily Workout Service (V2)
 *
 * Generates and returns the daily workout using agent-runner.
 * Replaces the old pipeline (check profile → check plan → check week → generate day).
 *
 * Flow:
 * 1. get-workout agent (reads context, generates workout)
 * 2. format-workout agent (formats for SMS + UI details)
 * 3. Inject into chat session for continuity
 */
import type { Runner } from '@agent-runner/core';
import { fitnessContextId, chatSessionId, appendMessageToSession } from '../helpers';

export interface DailyWorkoutResult {
  success: boolean;
  message?: string;
  details?: Record<string, unknown>;
  isRestDay?: boolean;
  error?: string;
}

export interface NewDailyWorkoutServiceInstance {
  generateDailyWorkout(userId: string, timezone?: string): Promise<DailyWorkoutResult>;
}

export interface NewDailyWorkoutServiceDeps {
  runner: Runner;
}

export function createNewDailyWorkoutService(deps: NewDailyWorkoutServiceDeps): NewDailyWorkoutServiceInstance {
  const { runner } = deps;

  return {
    async generateDailyWorkout(userId: string, timezone = 'America/New_York'): Promise<DailyWorkoutResult> {
      const contextId = fitnessContextId(userId);

      try {
        console.log('[NewDailyWorkoutService] Generating workout for user:', userId);

        // Step 1: Get workout from context
        const workoutResult = await runner.invoke('get-workout', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timezone,
        }), {
          contextIds: [contextId],
        });

        // Step 2: Format for SMS
        const formatResult = await runner.invoke('format-workout', workoutResult.output);

        // Parse formatted output
        let message: string;
        let details: Record<string, unknown> = {};
        let isRestDay = false;

        try {
          const parsed = JSON.parse(formatResult.output);
          message = parsed.message;
          details = parsed.details || {};
          isRestDay = details.isRestDay === true;
        } catch {
          message = formatResult.output;
        }

        // Also try to detect rest day from the workout result
        try {
          const workoutData = JSON.parse(workoutResult.output);
          if (workoutData.isRestDay) isRestDay = true;
        } catch {
          // Not JSON, that's fine
        }

        // Step 3: Inject into chat session
        await appendMessageToSession(runner, chatSessionId(userId), {
          role: 'assistant',
          content: message,
        });

        console.log('[NewDailyWorkoutService] Workout generated:', { userId, isRestDay });

        return {
          success: true,
          message,
          details,
          isRestDay,
        };
      } catch (error) {
        console.error('[NewDailyWorkoutService] Error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
