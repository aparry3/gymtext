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
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { onboardingSteps } from '@/server/services/orchestration/onboardingSteps';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { SignupData } from '@/server/repositories/onboardingRepository';

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
      await step.run('mark-started', () => onboardingDataService.markStarted(userId));

      // Step 1: Load user + signup data (cached by Inngest)
      // Note: Inngest serializes data between steps, so Date objects become strings.
      // We use type assertions to satisfy TypeScript - the underlying data works fine at runtime.
      const { user: initialUser, signupData } = await step.run('step-1-load-data', () =>
        onboardingSteps.loadData(userId)
      ) as unknown as { user: UserWithProfile; signupData: SignupData };

      // Step 2: Get or create profile (returns updated user)
      // forceCreate=true will always create new profile even if one exists
      const { user } = await step.run('step-2-profile', () =>
        onboardingSteps.getOrCreateProfile(initialUser, signupData, forceCreate)
      ) as unknown as { user: UserWithProfile; wasCreated: boolean };

      // Step 3: Get or create plan (uses user with profile)
      // forceCreate=true will always create new plan even if one exists
      const { plan } = await step.run('step-3-plan', () =>
        onboardingSteps.getOrCreatePlan(user, forceCreate)
      ) as unknown as { plan: FitnessPlan; wasCreated: boolean };

      // Step 4: Get or create microcycle (needs plan)
      // forceCreate=true will always create new microcycle even if one exists
      const { microcycle } = await step.run('step-4-microcycle', () =>
        onboardingSteps.getOrCreateMicrocycle(user, plan, forceCreate)
      ) as unknown as { microcycle: Microcycle; wasCreated: boolean };

      // Step 5: Get or create workout (needs microcycle)
      // forceCreate=true will always create new workout even if one exists
      await step.run('step-5-workout', () =>
        onboardingSteps.getOrCreateWorkout(user, microcycle, forceCreate)
      );

      // Step 6: Mark completed
      await step.run('step-6-complete', () =>
        onboardingSteps.markCompleted(userId)
      );

      // Step 7: Send messages
      const messagesSent = await step.run('step-7-messages', () =>
        onboardingSteps.sendMessages(userId)
      );

      console.log(`[Inngest] Onboarding complete for user ${userId}`);

      return { success: true, userId, messagesSent };
    } catch (error) {
      // Mark onboarding as failed
      console.error(`[Inngest] Onboarding failed for user ${userId}:`, error);

      try {
        await onboardingDataService.updateStatus(
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
