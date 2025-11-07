/**
 * Onboard User Function (Inngest)
 *
 * Async function that processes user onboarding after signup.
 * Triggered by 'user/onboarding.requested' event from signup API.
 *
 * Flow:
 * 1. Mark onboarding as 'in_progress'
 * 2. Extract fitness profile from signup data using LLM (slow!)
 * 3. Create fitness plan
 * 4. Mark onboarding as 'completed'
 * 5. Check if payment is complete, send messages if ready
 * 6. Clean up signup data
 *
 * Benefits:
 * - Runs async (doesn't block signup)
 * - Automatic retries on failure
 * - Parallel with checkout (race optimization)
 */

import { inngest } from '@/server/connections/inngest/client';
import { UserRepository } from '@/server/repositories/userRepository';
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { fitnessProfileService } from '@/server/services/user/fitnessProfileService';
import { onboardingService } from '@/server/services/orchestration/onboardingService';
import { onboardingCoordinator } from '@/server/services/orchestration/onboardingCoordinator';

export const onboardUserFunction = inngest.createFunction(
  {
    id: 'onboard-user',
    name: 'Onboard New User',
    retries: 2, // Retry up to 2 times on failure
  },
  { event: 'user/onboarding.requested' },
  async ({ event, step }) => {
    const { userId } = event.data;

    console.log(`[Inngest] Starting onboarding for user ${userId}`);

    try {
      // Step 1: Mark as in progress
      await step.run('mark-started', async () => {
        console.log(`[Inngest] Marking onboarding as started for ${userId}`);
        await onboardingDataService.markStarted(userId);
      });

    // Step 2: Load signup data
    const signupData = await step.run('load-signup-data', async () => {
      console.log(`[Inngest] Loading signup data for ${userId}`);

      const signupData = await onboardingDataService.getSignupData(userId);
      if (!signupData) {
        throw new Error(`No signup data found for user ${userId}`);
      }

      return signupData;
    });

    // Step 3: Extract fitness profile using LLM (SLOW!)
    await step.run('extract-fitness-profile', async () => {
      console.log(`[Inngest] Extracting fitness profile for ${userId} (LLM)`);

      // Load user fresh to avoid serialization issues
      const userRepo = new UserRepository();
      const user = await userRepo.findWithProfile(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      try {
        await fitnessProfileService.createFitnessProfile(user, {
          fitnessGoals: signupData.fitnessGoals,
          currentExercise: signupData.currentExercise,
          injuries: signupData.injuries,
          environment: signupData.environment,
        });
        console.log(`[Inngest] Fitness profile extracted for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to extract profile for ${userId}:`, error);
        throw error;
      }
    });

    // Step 4: Create fitness plan and workout
    await step.run('create-program', async () => {
      console.log(`[Inngest] Creating fitness program for ${userId}`);

      // Reload user with updated profile
      const userRepo = new UserRepository();
      const userWithProfile = await userRepo.findWithProfile(userId);
      if (!userWithProfile) {
        throw new Error(`User ${userId} not found after profile creation`);
      }

      try {
        await onboardingService.createProgramAndWorkout(userWithProfile);
        console.log(`[Inngest] Fitness program created for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to create program for ${userId}:`, error);
        throw error;
      }
    });

    // Step 5: Mark as completed
    await step.run('mark-completed', async () => {
      console.log(`[Inngest] Marking onboarding as completed for ${userId}`);
      await onboardingDataService.markCompleted(userId);
    });

    // Step 6: Check if ready to send onboarding messages
    await step.run('check-send-messages', async () => {
      console.log(`[Inngest] Checking if ready to send messages for ${userId}`);

      try {
        const sent = await onboardingCoordinator.sendOnboardingMessages(userId);
        if (sent) {
          console.log(`[Inngest] Onboarding messages sent to ${userId}`);
        } else {
          console.log(`[Inngest] Waiting for payment to complete for ${userId}`);
        }
      } catch (error) {
        // Don't fail the whole onboarding if message sending fails
        // Webhook will retry when payment completes
        console.error(`[Inngest] Failed to send messages for ${userId}:`, error);
      }
    });

    // Step 7: Clean up signup data
    await step.run('cleanup-signup-data', async () => {
      console.log(`[Inngest] Cleaning up signup data for ${userId}`);
      await onboardingDataService.clearSignupData(userId);
    });

      console.log(`[Inngest] Onboarding complete for user ${userId}`);

      return {
        success: true,
        userId,
      };
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
