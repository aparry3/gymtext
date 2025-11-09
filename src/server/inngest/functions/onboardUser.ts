/**
 * Onboard User Function (Inngest)
 *
 * Async function that processes user onboarding after signup.
 * Triggered by 'user/onboarding.requested' event from signup API.
 *
 * Flow:
 * 1. Mark onboarding as 'in_progress'
 * 2. Load raw signup data
 * 3. Format signup data for LLM using signupDataFormatter
 * 4. Extract fitness profile from formatted data using LLM (slow!)
 * 5. Create fitness plan with message
 * 6. Create first microcycle with message
 * 7. Create first workout with message
 * 8. Mark onboarding as 'completed'
 * 9. Check if payment is complete, send messages if ready
 * 10. Clean up signup data (optional)
 *
 * Benefits:
 * - Runs async (doesn't block signup)
 * - Automatic retries on failure per step
 * - Parallel with checkout (race optimization)
 * - Pre-generates all messages for fast delivery
 * - All raw signup data preserved for debugging/analytics
 */

import { inngest } from '@/server/connections/inngest/client';
import { UserRepository } from '@/server/repositories/userRepository';
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { fitnessProfileService } from '@/server/services/user/fitnessProfileService';
import { onboardingService } from '@/server/services/orchestration/onboardingService';
import { onboardingCoordinator } from '@/server/services/orchestration/onboardingCoordinator';
import { formatSignupDataForLLM } from '@/server/services/user/signupDataFormatter';

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
        // Format raw signup data for LLM consumption
        const formattedData = formatSignupDataForLLM(signupData);

        await fitnessProfileService.createFitnessProfile(user, {
          fitnessGoals: formattedData.fitnessGoals,
          currentExercise: formattedData.currentExercise,
          injuries: formattedData.injuries,
          environment: formattedData.environment,
        });
        console.log(`[Inngest] Fitness profile extracted for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to extract profile for ${userId}:`, error);
        throw error;
      }
    });

    // Step 4: Create fitness plan
    await step.run('create-fitness-plan', async () => {
      console.log(`[Inngest] Creating fitness plan for ${userId}`);

      // Reload user with updated profile
      const userRepo = new UserRepository();
      const userWithProfile = await userRepo.findWithProfile(userId);
      if (!userWithProfile) {
        throw new Error(`User ${userId} not found after profile creation`);
      }

      try {
        await onboardingService.createFitnessPlan(userWithProfile);
        console.log(`[Inngest] Fitness plan created for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to create fitness plan for ${userId}:`, error);
        throw error;
      }
    });

    // Step 5: Create first microcycle
    await step.run('create-first-microcycle', async () => {
      console.log(`[Inngest] Creating first microcycle for ${userId}`);

      // Reload user (ensure fresh data)
      const userRepo = new UserRepository();
      const userWithProfile = await userRepo.findWithProfile(userId);
      if (!userWithProfile) {
        throw new Error(`User ${userId} not found`);
      }

      try {
        await onboardingService.createFirstMicrocycle(userWithProfile);
        console.log(`[Inngest] First microcycle created for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to create first microcycle for ${userId}:`, error);
        throw error;
      }
    });

    // Step 6: Create first workout
    await step.run('create-first-workout', async () => {
      console.log(`[Inngest] Creating first workout for ${userId}`);

      // Reload user (ensure fresh data)
      const userRepo = new UserRepository();
      const userWithProfile = await userRepo.findWithProfile(userId);
      if (!userWithProfile) {
        throw new Error(`User ${userId} not found`);
      }

      try {
        await onboardingService.createFirstWorkout(userWithProfile);
        console.log(`[Inngest] First workout created for ${userId}`);
      } catch (error) {
        console.error(`[Inngest] Failed to create first workout for ${userId}:`, error);
        throw error;
      }
    });

    // Step 7: Mark as completed
    await step.run('mark-completed', async () => {
      console.log(`[Inngest] Marking onboarding as completed for ${userId}`);
      await onboardingDataService.markCompleted(userId);
    });

    // Step 8: Check if ready to send onboarding messages
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

    // Step 9: Clean up signup data
    // TEMP: Commented out for debugging - keeping signup data for inspection
    // await step.run('cleanup-signup-data', async () => {
    //   console.log(`[Inngest] Cleaning up signup data for ${userId}`);
    //   await onboardingDataService.clearSignupData(userId);
    // });

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
