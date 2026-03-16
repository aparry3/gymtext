/**
 * New Onboarding Service (V2)
 *
 * Handles user onboarding using agent-runner.
 * Replaces the old 7-step pipeline with 3 agent calls:
 * 1. update-fitness (create comprehensive context from signup data)
 * 2. get-workout (generate first workout)
 * 3. format-workout (format for SMS)
 */
import type { Runner } from '@agent-runner/core';
import type { UserWithProfile } from '@/server/models/user';
import { fitnessContextId, chatSessionId, appendMessageToSession } from '../helpers';
import { agentLogger } from '../logger';

export interface OnboardingResult {
  success: boolean;
  workoutMessage?: string;
  workoutDetails?: Record<string, unknown>;
  error?: string;
}

export interface NewOnboardingServiceInstance {
  onboardUser(user: UserWithProfile, signupData: Record<string, unknown>): Promise<OnboardingResult>;
}

export interface NewOnboardingServiceDeps {
  runner: Runner;
}

export function createNewOnboardingService(deps: NewOnboardingServiceDeps): NewOnboardingServiceInstance {
  const { runner } = deps;

  return {
    async onboardUser(user: UserWithProfile, signupData: Record<string, unknown>): Promise<OnboardingResult> {
      const userId = user.id;
      const timezone = user.timezone || 'America/New_York';
      const contextId = fitnessContextId(userId);

      const SVC = 'NewOnboardingService';
      try {
        agentLogger.info({ service: SVC, event: 'starting', userId });

        // Step 1: Create comprehensive fitness context from signup data
        const signupDescription = formatSignupData(signupData, user);
        agentLogger.info({ service: SVC, event: 'creating_context', userId, agentId: 'update-fitness' });
        const ctxResult = await runner.invoke('update-fitness', signupDescription, {
          contextIds: [contextId],
        });
        agentLogger.invocation(SVC, userId, ctxResult, 'update-fitness');

        // Step 2: Generate first workout
        agentLogger.info({ service: SVC, event: 'generating_workout', userId, agentId: 'get-workout' });
        const workoutResult = await runner.invoke('get-workout', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timezone,
        }), {
          contextIds: [contextId],
        });
        agentLogger.invocation(SVC, userId, workoutResult, 'get-workout');

        // Step 3: Format workout for SMS
        const formatResult = await runner.invoke('format-workout', workoutResult.output);
        agentLogger.invocation(SVC, userId, formatResult, 'format-workout');

        // Parse formatted output
        let message: string;
        let details: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(formatResult.output);
          message = parsed.message;
          details = parsed.details || {};
        } catch {
          message = formatResult.output;
        }

        // Inject the workout message into the chat session for continuity
        await appendMessageToSession(runner, chatSessionId(userId), {
          role: 'assistant',
          content: message,
        });

        agentLogger.info({ service: SVC, event: 'complete', userId });

        return {
          success: true,
          workoutMessage: message,
          workoutDetails: details,
        };
      } catch (error) {
        agentLogger.error({ service: SVC, event: 'error', userId, error: error instanceof Error ? error.message : String(error) });
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

/**
 * Format signup data into a descriptive string for the update-fitness agent.
 */
function formatSignupData(signupData: Record<string, unknown>, user: UserWithProfile): string {
  const parts: string[] = ['New user onboarding. Create a complete fitness context from this signup data:'];

  if (user.name) parts.push(`Name: ${user.name}`);
  if (user.timezone) parts.push(`Timezone: ${user.timezone}`);

  // Include all signup data fields
  for (const [key, value] of Object.entries(signupData)) {
    if (value !== null && value !== undefined && value !== '') {
      parts.push(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`);
    }
  }

  return parts.join('\n');
}
