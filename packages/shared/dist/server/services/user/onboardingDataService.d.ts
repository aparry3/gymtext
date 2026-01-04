import { type OnboardingRecord, type SignupData, type OnboardingStatus } from '@/server/repositories/onboardingRepository';
/**
 * OnboardingDataService
 *
 * Service layer for managing user onboarding state and signup data.
 * Wraps OnboardingRepository to provide clean service-level interface.
 *
 * Responsibilities:
 * - Manage onboarding lifecycle (pending → in_progress → completed/failed)
 * - Store and retrieve signup form data
 * - Track message sending status (idempotency)
 * - Coordinate cleanup after completion
 *
 * Architecture:
 * Routes/Inngest → OnboardingDataService → OnboardingRepository → Database
 */
export declare class OnboardingDataService {
    private static instance;
    private repository;
    private constructor();
    static getInstance(): OnboardingDataService;
    /**
     * Create a new onboarding record for a user
     * Called during signup to initialize onboarding tracking
     */
    createOnboardingRecord(userId: string, signupData?: SignupData): Promise<OnboardingRecord>;
    /**
     * Mark onboarding as started (status: pending → in_progress)
     */
    markStarted(userId: string): Promise<OnboardingRecord>;
    /**
     * Update current step for progress tracking
     */
    updateCurrentStep(userId: string, stepNumber: number): Promise<OnboardingRecord>;
    /**
     * Mark onboarding as completed (status: in_progress → completed)
     */
    markCompleted(userId: string): Promise<OnboardingRecord>;
    /**
     * Update onboarding status with optional error message
     * Used for marking as failed or updating status manually
     */
    updateStatus(userId: string, status: OnboardingStatus, errorMessage?: string): Promise<OnboardingRecord>;
    /**
     * Get onboarding status for a client
     */
    getStatus(clientId: string): Promise<OnboardingStatus | null>;
    /**
     * Get complete onboarding record by client ID
     */
    findByClientId(clientId: string): Promise<OnboardingRecord | null>;
    /**
     * Get signup data for a user
     * Used during async onboarding to retrieve form data
     */
    getSignupData(userId: string): Promise<SignupData | null>;
    /**
     * Clear signup data after profile extraction
     * Cleanup to remove temporary form data
     */
    clearSignupData(userId: string): Promise<OnboardingRecord>;
    /**
     * Mark final program messages as sent
     * Used for idempotency - ensures messages only sent once
     */
    markMessagesSent(userId: string): Promise<OnboardingRecord>;
    /**
     * Check if final messages have been sent
     * Used to prevent duplicate message sending
     */
    hasMessagesSent(userId: string): Promise<boolean>;
    /**
     * Delete onboarding record (full cleanup)
     * Optional: can be used to clean up old records
     */
    delete(userId: string): Promise<void>;
}
export declare const onboardingDataService: OnboardingDataService;
//# sourceMappingURL=onboardingDataService.d.ts.map