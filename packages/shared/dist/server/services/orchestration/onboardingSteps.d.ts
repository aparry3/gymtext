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
import type { SignupData } from '@/server/repositories/onboardingRepository';
import type { UserWithProfile } from '@/server/models/user';
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstance } from '@/server/models/workout';
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
    workout: WorkoutInstance;
    wasCreated: boolean;
}
export declare const onboardingSteps: {
    /**
     * Step 1: Load user and signup data
     * Returns user to be passed to all subsequent steps
     */
    loadData(userId: string): Promise<LoadDataResult>;
    /**
     * Step 2: Get or create fitness profile
     * Returns updated user with profile for subsequent steps
     *
     * @param forceCreate - When true, always creates new profile (for re-onboarding)
     */
    getOrCreateProfile(user: UserWithProfile, signupData: SignupData, forceCreate?: boolean): Promise<ProfileResult>;
    /**
     * Step 3: Get or create fitness plan
     *
     * @param forceCreate - When true, always creates new plan (for re-onboarding)
     */
    getOrCreatePlan(user: UserWithProfile, forceCreate?: boolean): Promise<PlanResult>;
    /**
     * Step 4: Get or create microcycle
     * Needs plan for week calculation
     *
     * @param forceCreate - When true, always creates new microcycle (for re-onboarding)
     */
    getOrCreateMicrocycle(user: UserWithProfile, plan: FitnessPlan, forceCreate?: boolean): Promise<MicrocycleResult>;
    /**
     * Step 5: Get or create workout
     * Needs microcycle for day pattern and isDeload flag
     *
     * @param forceCreate - When true, always creates new workout (for re-onboarding)
     */
    getOrCreateWorkout(user: UserWithProfile, microcycle: Microcycle, forceCreate?: boolean): Promise<WorkoutResult>;
    /**
     * Step 6: Mark completed (idempotent)
     */
    markCompleted(userId: string): Promise<void>;
    /**
     * Step 7: Send messages (idempotent - coordinator checks if already sent)
     */
    sendMessages(userId: string): Promise<boolean>;
};
//# sourceMappingURL=onboardingSteps.d.ts.map