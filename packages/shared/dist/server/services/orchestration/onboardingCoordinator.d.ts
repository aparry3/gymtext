/**
 * OnboardingCoordinator
 *
 * Coordinates the final step of onboarding: sending program messages
 * Only sends messages when BOTH conditions are met:
 * 1. Onboarding status = 'completed' (profile + plan created)
 * 2. User has active subscription (payment completed)
 *
 * This ensures users only receive their program after payment,
 * and prevents duplicate messages using idempotency flag.
 */
export declare class OnboardingCoordinator {
    private static instance;
    private subscriptionRepo;
    private onboardingService;
    private constructor();
    static getInstance(): OnboardingCoordinator;
    /**
     * Attempt to send onboarding messages
     *
     * Checks:
     * 1. Messages not already sent (idempotency)
     * 2. Onboarding status is 'completed'
     * 3. User has active subscription
     *
     * If all conditions met, sends messages and marks as sent
     */
    sendOnboardingMessages(userId: string): Promise<boolean>;
}
export declare const onboardingCoordinator: OnboardingCoordinator;
//# sourceMappingURL=onboardingCoordinator.d.ts.map