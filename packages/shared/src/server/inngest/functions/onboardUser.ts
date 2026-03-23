/**
 * Onboard User Function (Inngest)
 *
 * Async function that processes user onboarding after signup.
 * Triggered by 'user/onboarding.requested' event from signup API.
 *
 * Uses a "get or create" pattern for each step:
 * - If data exists, returns it immediately (cached by Inngest)
 * - If not, creates it via LLM
 *
 * When forceCreate=true (for re-onboarding subscribed users):
 * - Always creates new profile, plan, microcycle, workout
 * - Old data is preserved for history
 *
 * This makes the flow idempotent - running multiple times produces same result.
 *
 * Data Flow:
 * Step 1 (loadData) → { initialUser, signupData }
 * Step 2 (profile)  → { user } (with profile)
 * Step 3 (plan)     → { plan }
 * Step 4 (microcycle) → { microcycle }
 * Step 5 (workout)  → { workout }
 * Step 6 (markCompleted)
 * Step 7 (sendMessages)
 */

import { inngest } from '@/server/connections/inngest/client';
import { createServicesFromDb } from '@/server/services';
import { createOnboardingSteps } from '@/server/services/orchestration/onboardingSteps';
import { postgresDb } from '@/server/connections/postgres/postgres';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { SignupData } from '@/server/repositories/onboardingRepository';

// Create services container at module level (Inngest always uses production)
const services = createServicesFromDb(postgresDb);
const onboardingSteps = createOnboardingSteps(services);

const useAgentRunner = () => process.env.USE_AGENT_RUNNER === 'true';

export const onboardUserFunction = inngest.createFunction(
  {
    id: 'onboard-user',
    name: 'Onboard New User',
    retries: 2,
  },
  { event: 'user/onboarding.requested' },
  async ({ event, step }) => {
    const { userId, forceCreate = false } = event.data;

    try {
      // Mark as started
      await step.run('mark-started', () => services.onboardingData.markStarted(userId));

      // V2: Use agent-runner if enabled
      if (useAgentRunner()) {
        console.log(`[Inngest] Using agent-runner V2 for onboarding user ${userId}`);

        const result = await step.run('v2-onboard', async () => {
          const user = await services.user.getUser(userId);
          if (!user) throw new Error(`User ${userId} not found`);

          // Get signup data
          const signupData = await services.onboardingData.getSignupData(userId) ?? {};

          const { getRunner } = await import('@/server/agent-runner/runner');
          const { createNewOnboardingService } = await import('@/server/agent-runner/services/newOnboardingService');
          const newOnboarding = createNewOnboardingService({ runner: getRunner() });
          const onboardResult = await newOnboarding.onboardUser(user, signupData as Record<string, unknown>);

          if (!onboardResult.success) {
            throw new Error(`Onboarding failed: ${onboardResult.error}`);
          }

          // Send all onboarding messages in order:
          // 1. Welcome message (static)
          // 2. Plan summary (LLM-generated)
          // 3. Workout message (LLM-generated)
          const messagesToSend = onboardResult.messages
            .filter(Boolean)
            .map(content => ({ content }));

          if (messagesToSend.length > 0) {
            await services.messagingOrchestrator.queueMessages(user, messagesToSend, 'onboarding');
          }

          return onboardResult;
        });

        // Mark completed
        await step.run('v2-complete', () => services.onboardingData.markCompleted(userId));

        console.log(`[Inngest] V2 onboarding complete for user ${userId}`);
        return { success: true, userId, v2: true };
      }

      // V1: Legacy 7-step path
      // Step 1: Load user + signup data (cached by Inngest)
      const { user: initialUser, signupData } = await step.run('step-1-load-data', () =>
        onboardingSteps.loadData(userId)
      ) as unknown as { user: UserWithProfile; signupData: SignupData };

      const { user } = await step.run('step-2-profile', () =>
        onboardingSteps.getOrCreateProfile(initialUser, signupData, forceCreate)
      ) as unknown as { user: UserWithProfile; wasCreated: boolean };

      const { plan } = await step.run('step-3-plan', () =>
        onboardingSteps.getOrCreatePlan(user, signupData, forceCreate)
      ) as unknown as { plan: FitnessPlan; wasCreated: boolean };

      const { microcycle } = await step.run('step-4-microcycle', () =>
        onboardingSteps.getOrCreateMicrocycle(user, plan, forceCreate)
      ) as unknown as { microcycle: Microcycle; wasCreated: boolean };

      await step.run('step-5-workout', () =>
        onboardingSteps.getOrCreateWorkout(user, microcycle, forceCreate)
      );

      await step.run('step-6-complete', () =>
        onboardingSteps.markCompleted(userId)
      );

      const messagesSent = await step.run('step-7-messages', () =>
        onboardingSteps.sendMessages(userId)
      );

      console.log(`[Inngest] Onboarding complete for user ${userId}`);

      return { success: true, userId, messagesSent };
    } catch (error) {
      // Mark onboarding as failed
      console.error(`[Inngest] Onboarding failed for user ${userId}:`, error);

      try {
        await services.onboardingData.updateStatus(
          userId,
          'failed',
          error instanceof Error ? error.message : 'Unknown error during onboarding'
        );
      } catch (updateError) {
        console.error(`[Inngest] Failed to update onboarding status for ${userId}:`, updateError);
      }

      // Re-throw to let Inngest handle retries
      throw error;
    }
  }
);
