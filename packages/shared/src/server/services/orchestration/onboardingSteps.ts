/**
 * Onboarding Steps Service
 *
 * Idempotent step execution logic for user onboarding.
 * Each step uses a "get or create" pattern - checks if data exists,
 * returns it if so, otherwise creates via LLM.
 *
 * When forceCreate=true (for re-onboarding subscribed users):
 * - Skips the "get existing" check
 * - Always creates new data
 * - Old data is preserved for history
 *
 * This makes the onboarding flow:
 * - Truly idempotent - running multiple times produces same result
 * - Resumable - if data exists, it's returned without re-creation
 * - Testable - each step has clear inputs and outputs
 *
 * Used by the Inngest onboardUser function.
 */

import { now } from '@/shared/utils/date';
import { getProgramConfig } from '@/shared/config';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { ServiceContainer } from '../factory';
import type { WorkoutData } from './trainingService';

// Return types for each step
export interface LoadDataResult {
  user: UserWithProfile;
  signupData: SignupData;
}

export interface ProfileResult {
  user: UserWithProfile;
  wasCreated: boolean;
}

export interface PlanResult {
  plan: FitnessPlan;
  wasCreated: boolean;
}

export interface MicrocycleResult {
  microcycle: Microcycle;
  wasCreated: boolean;
}

export interface WorkoutResult {
  workout: WorkoutData;
  wasCreated: boolean;
}

/**
 * OnboardingSteps interface
 */
export interface OnboardingSteps {
  loadData(userId: string): Promise<LoadDataResult>;
  getOrCreateProfile(user: UserWithProfile, signupData: SignupData, forceCreate?: boolean): Promise<ProfileResult>;
  getOrCreatePlan(user: UserWithProfile, signupData: SignupData, forceCreate?: boolean): Promise<PlanResult>;
  getOrCreateMicrocycle(user: UserWithProfile, plan: FitnessPlan, forceCreate?: boolean): Promise<MicrocycleResult>;
  getOrCreateWorkout(user: UserWithProfile, microcycle: Microcycle, forceCreate?: boolean): Promise<WorkoutResult>;
  markCompleted(userId: string): Promise<void>;
  sendMessages(userId: string): Promise<boolean>;
}

/**
 * Create onboarding steps with injected services
 */
export function createOnboardingSteps(services: ServiceContainer): OnboardingSteps {
  const {
    user: userService,
    onboardingData: onboardingDataService,
    fitnessProfile: fitnessProfileService,
    markdown: markdownService,
    training: trainingService,
    onboardingCoordinator,
    enrollment: enrollmentService,
    program: programService,
  } = services;

  return {
    /**
     * Step 1: Load user and signup data
     * Returns user to be passed to all subsequent steps
     */
    async loadData(userId: string): Promise<LoadDataResult> {
      console.log(`[Onboarding] Step 1: Loading user and signup data for ${userId}`);

      const user = await userService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      const signupData = await onboardingDataService.getSignupData(userId);
      if (!signupData) {
        throw new Error(`No signup data found for user ${userId}`);
      }

      return { user, signupData };
    },

    /**
     * Step 2: Get or create fitness profile
     * Returns updated user with profile for subsequent steps
     *
     * @param forceCreate - When true, always creates new profile (for re-onboarding)
     */
    async getOrCreateProfile(
      user: UserWithProfile,
      signupData: SignupData,
      forceCreate = false
    ): Promise<ProfileResult> {
      // Only check for existing profile if not forcing creation
      if (!forceCreate) {
        const existingProfile = await fitnessProfileService.getCurrentProfile(user.id);
        if (existingProfile) {
          console.log(`[Onboarding] Step 2: Profile already exists for ${user.id}`);
          return { user, wasCreated: false };
        }
      }

      console.log(`[Onboarding] Step 2: Creating profile for ${user.id} (LLM)${forceCreate ? ' [forceCreate]' : ''}`);
      await fitnessProfileService.createFitnessProfile(user, signupData);

      // Re-fetch user to get updated profile
      const updatedUser = await userService.getUser(user.id);
      if (!updatedUser) {
        throw new Error(`User ${user.id} not found after profile creation`);
      }

      return { user: updatedUser, wasCreated: true };
    },

    /**
     * Step 3: Get or create fitness plan
     *
     * Ensures user is enrolled in AI program and links the plan version.
     *
     * @param forceCreate - When true, always creates new plan (for re-onboarding)
     */
    async getOrCreatePlan(user: UserWithProfile, signupData: SignupData, forceCreate = false): Promise<PlanResult> {
      // Ensure user is enrolled in a program
      let enrollment = await enrollmentService.getActiveEnrollment(user.id);
      if (!enrollment) {
        // Resolve program: use signupData.programId, fall back to DEFAULT_PROGRAM_ID config
        const programId = signupData.programId || getProgramConfig().defaultProgramId;
        if (!programId) {
          throw new Error('No programId in signup data and DEFAULT_PROGRAM_ID is not configured');
        }

        const program = await programService.getById(programId);
        if (!program) {
          throw new Error(`Program ${programId} not found`);
        }

        console.log(`[Onboarding] Step 3: Creating program enrollment for ${user.id} (program: ${program.id})`);
        enrollment = await enrollmentService.enrollClient(user.id, program.id, {
          programVersionId: program.publishedVersionId ?? undefined,
        });
      }

      // Only check for existing plan if not forcing creation
      if (!forceCreate) {
        const existingPlan = await markdownService.getPlan(user.id);
        if (existingPlan) {
          console.log(`[Onboarding] Step 3: Plan already exists for ${user.id}`);
          return { plan: existingPlan, wasCreated: false };
        }
      }

      console.log(`[Onboarding] Step 3: Creating plan for ${user.id} (LLM)${forceCreate ? ' [forceCreate]' : ''}`);
      const plan = await trainingService.createFitnessPlan(user, {
        programId: enrollment.programId,
        programVersionId: enrollment.programVersionId ?? undefined,
      });

      return { plan, wasCreated: true };
    },

    /**
     * Step 4: Get or create microcycle
     * Needs plan for week calculation
     *
     * @param forceCreate - When true, always creates new microcycle (for re-onboarding)
     */
    async getOrCreateMicrocycle(
      user: UserWithProfile,
      plan: FitnessPlan,
      forceCreate = false
    ): Promise<MicrocycleResult> {
      const currentDate = now(user.timezone).toJSDate();
      const { microcycle, wasCreated } = await trainingService.prepareMicrocycleForDate(
        user.id,
        plan,
        currentDate,
        user.timezone
      );

      if (!microcycle) {
        throw new Error(`Could not get/create microcycle for user ${user.id}`);
      }

      console.log(`[Onboarding] Step 4: Microcycle ${wasCreated ? 'created' : 'already exists'} for ${user.id}${forceCreate ? ' [forceCreate]' : ''}`);
      return { microcycle, wasCreated };
    },

    /**
     * Step 5: Get or create workout
     * Needs microcycle for day pattern
     *
     * @param forceCreate - When true, always creates new workout (for re-onboarding)
     */
    async getOrCreateWorkout(
      user: UserWithProfile,
      _microcycle: Microcycle,
      forceCreate = false
    ): Promise<WorkoutResult> {
      const targetDate = now(user.timezone).startOf('day');

      console.log(`[Onboarding] Step 5: Creating workout for ${user.id} (LLM)${forceCreate ? ' [forceCreate]' : ''}`);
      const workout = await trainingService.prepareWorkoutForDate(user, targetDate);
      if (!workout) {
        throw new Error(`Failed to generate workout for user ${user.id}`);
      }

      return { workout, wasCreated: true };
    },

    /**
     * Step 6: Mark completed (idempotent)
     */
    async markCompleted(userId: string): Promise<void> {
      console.log(`[Onboarding] Step 6: Marking onboarding as completed for ${userId}`);
      await onboardingDataService.markCompleted(userId);
    },

    /**
     * Step 7: Send messages (idempotent - coordinator checks if already sent)
     */
    async sendMessages(userId: string): Promise<boolean> {
      console.log(`[Onboarding] Step 7: Sending onboarding messages for ${userId}`);

      try {
        const sent = await onboardingCoordinator.sendOnboardingMessages(userId);
        if (sent) {
          console.log(`[Onboarding] Onboarding messages sent to ${userId}`);
        } else {
          console.log(`[Onboarding] Waiting for payment to complete for ${userId}`);
        }
        return sent;
      } catch (error) {
        // Don't fail the whole onboarding if message sending fails
        // Webhook will retry when payment completes
        console.error(`[Onboarding] Failed to send messages for ${userId}:`, error);
        return false;
      }
    },
  };
}

