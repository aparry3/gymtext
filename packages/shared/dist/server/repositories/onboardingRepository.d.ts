import { BaseRepository } from './baseRepository';
import type { UserOnboarding } from '../models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';
export type OnboardingRecord = Selectable<UserOnboarding>;
export type NewOnboardingRecord = Insertable<UserOnboarding>;
export type OnboardingUpdate = Updateable<UserOnboarding>;
export interface SignupData {
    fitnessGoals?: string;
    currentExercise?: string;
    injuries?: string;
    environment?: string;
    primaryGoals?: ('strength' | 'endurance' | 'weight_loss' | 'general_fitness')[];
    goalsElaboration?: string;
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced';
    desiredDaysPerWeek?: '3_per_week' | '4_per_week' | '5_per_week' | '6_per_week';
    availabilityElaboration?: string;
    trainingLocation?: 'home' | 'commercial_gym' | 'bodyweight';
    equipment?: string[];
    acceptedRisks?: boolean;
}
export type OnboardingStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
/**
 * OnboardingRepository
 *
 * Manages user onboarding state and signup data
 */
export declare class OnboardingRepository extends BaseRepository {
    /**
     * Create an onboarding record for a client
     */
    create(clientId: string, signupData?: SignupData): Promise<OnboardingRecord>;
    /**
     * Find onboarding record by client ID
     */
    findByClientId(clientId: string): Promise<OnboardingRecord | null>;
    /**
     * Update onboarding status
     */
    updateStatus(clientId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord>;
    /**
     * Mark onboarding as started
     */
    markStarted(clientId: string): Promise<OnboardingRecord>;
    /**
     * Update current step (for progress tracking)
     */
    updateCurrentStep(clientId: string, stepNumber: number): Promise<OnboardingRecord>;
    /**
     * Mark onboarding as completed
     */
    markCompleted(clientId: string): Promise<OnboardingRecord>;
    /**
     * Mark final program messages as sent
     */
    markMessagesSent(clientId: string): Promise<OnboardingRecord>;
    /**
     * Check if messages have been sent
     */
    hasMessagesSent(clientId: string): Promise<boolean>;
    /**
     * Get signup data
     */
    getSignupData(clientId: string): Promise<SignupData | null>;
    /**
     * Clear signup data (cleanup after profile creation)
     */
    clearSignupData(clientId: string): Promise<OnboardingRecord>;
    /**
     * Delete onboarding record (full cleanup)
     */
    delete(clientId: string): Promise<void>;
}
//# sourceMappingURL=onboardingRepository.d.ts.map