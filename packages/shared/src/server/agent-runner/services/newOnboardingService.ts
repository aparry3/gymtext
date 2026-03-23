/**
 * New Onboarding Service (V2)
 *
 * Handles user onboarding using agent-runner.
 * Replaces the old 7-step pipeline with 4 agent calls:
 * 1. update-fitness (create comprehensive context from signup data)
 * 2. chat (generate plan summary from fitness context)
 * 3. get-workout (generate first workout)
 * 4. format-workout (format for SMS)
 *
 * Also sends the welcome message (static template, no LLM needed).
 */
import type { Runner } from '@agent-runner/core';
import type { UserWithProfile } from '@/server/models/user';
import { fitnessContextId, chatSessionId, appendMessageToSession } from '../helpers';
import { agentLogger } from '../logger';

export interface OnboardingResult {
  success: boolean;
  welcomeMessage: string;
  planSummaryMessage?: string;
  workoutMessage?: string;
  workoutDetails?: Record<string, unknown>;
  /** All messages in send order */
  messages: string[];
  error?: string;
}

/** Static welcome message — no LLM needed */
const WELCOME_MESSAGE =
  "Welcome to GymText! Ready to transform your fitness? We'll be texting you daily workouts starting soon. Msg & data rates may apply. Reply HELP for support or STOP to opt out.";

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
      const sessionId = chatSessionId(userId);

      const SVC = 'NewOnboardingService';
      const allMessages: string[] = [];

      try {
        agentLogger.info({ service: SVC, event: 'starting', userId });

        // Step 1: Create comprehensive fitness context from signup data
        const signupDescription = formatSignupData(signupData, user);
        agentLogger.info({ service: SVC, event: 'creating_context', userId, agentId: 'update-fitness' });
        const ctxResult = await runner.invoke('update-fitness', signupDescription, {
          contextIds: [contextId],
        });
        agentLogger.invocation(SVC, userId, ctxResult, 'update-fitness');

        // Step 2: Generate plan summary from fitness context
        // Uses chat agent with context to produce a natural plan overview
        agentLogger.info({ service: SVC, event: 'generating_plan_summary', userId, agentId: 'chat' });
        const planSummaryResult = await runner.invoke(
          'chat',
          'Generate a brief, exciting plan summary for this new user. ' +
          'Introduce their training plan: what kind of split they\'ll follow, how many days per week, ' +
          'what their first week looks like, and when their first workout starts. ' +
          'Keep it under 1200 characters (SMS-friendly). Be warm and motivating. ' +
          'Do NOT include the actual workout exercises — just the plan overview.',
          {
            contextIds: [contextId],
            sessionId,
          }
        );
        agentLogger.invocation(SVC, userId, planSummaryResult, 'chat');
        const planSummaryMessage = planSummaryResult.output;

        // Step 3: Generate first workout
        agentLogger.info({ service: SVC, event: 'generating_workout', userId, agentId: 'get-workout' });
        const workoutResult = await runner.invoke('get-workout', JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          timezone,
        }), {
          contextIds: [contextId],
        });
        agentLogger.invocation(SVC, userId, workoutResult, 'get-workout');

        // Step 4: Format workout for SMS
        const formatResult = await runner.invoke('format-workout', workoutResult.output);
        agentLogger.invocation(SVC, userId, formatResult, 'format-workout');

        // Parse formatted output
        let workoutMessage: string;
        let details: Record<string, unknown> = {};
        try {
          const parsed = JSON.parse(formatResult.output);
          workoutMessage = parsed.message;
          details = parsed.details || {};
        } catch {
          workoutMessage = formatResult.output;
        }

        // Build message queue (in send order)
        allMessages.push(WELCOME_MESSAGE);
        allMessages.push(planSummaryMessage);
        allMessages.push(workoutMessage);

        // Inject messages into chat session for continuity
        // (plan summary and workout so the chat agent has context)
        await appendMessageToSession(runner, sessionId, {
          role: 'assistant',
          content: planSummaryMessage,
        });
        await appendMessageToSession(runner, sessionId, {
          role: 'assistant',
          content: workoutMessage,
        });

        agentLogger.info({ service: SVC, event: 'complete', userId, meta: { messageCount: allMessages.length } });

        return {
          success: true,
          welcomeMessage: WELCOME_MESSAGE,
          planSummaryMessage,
          workoutMessage,
          workoutDetails: details,
          messages: allMessages,
        };
      } catch (error) {
        agentLogger.error({ service: SVC, event: 'error', userId, error: error instanceof Error ? error.message : String(error) });
        return {
          success: false,
          welcomeMessage: WELCOME_MESSAGE,
          messages: allMessages.length > 0 ? allMessages : [WELCOME_MESSAGE],
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
