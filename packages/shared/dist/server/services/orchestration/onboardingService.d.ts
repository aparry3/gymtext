import { UserWithProfile } from '../../models/user';
/**
 * OnboardingService
 *
 * Orchestrates the complete user onboarding flow:
 * 1. Send welcome message
 * 2. Create fitness plan
 * 3. Send plan summary
 * 4. Send first daily workout
 *
 * Uses ConversationFlowBuilder to maintain natural conversation flow
 * and avoid repetitive greetings.
 *
 * Responsibilities:
 * - Coordinate multiple services for onboarding
 * - Handle onboarding flow logic
 * - Ensure proper sequencing of onboarding steps
 * - Maintain conversation context across messages
 */
export declare class OnboardingService {
    private static instance;
    private fitnessPlanService;
    private messageService;
    private dailyMessageService;
    private workoutInstanceService;
    private progressService;
    private constructor();
    static getInstance(): OnboardingService;
    /**
     * Create fitness plan with pre-generated message
     * Step 1 of onboarding entity creation
     *
     * @param user - The user to create plan for
     * @throws Error if creation fails
     */
    createFitnessPlan(user: UserWithProfile): Promise<void>;
    /**
     * Create first microcycle with pre-generated message
     * Step 2 of onboarding entity creation
     * Requires fitness plan to exist
     *
     * @param user - The user to create microcycle for
     * @throws Error if creation fails
     */
    createFirstMicrocycle(user: UserWithProfile): Promise<void>;
    /**
     * Create first workout with pre-generated message
     * Step 3 of onboarding entity creation
     * Requires fitness plan and microcycle to exist
     *
     * @param user - The user to create workout for
     * @throws Error if creation fails
     */
    createFirstWorkout(user: UserWithProfile): Promise<void>;
    /**
     * Send onboarding messages (combined plan+week + workout)
     * Called after both onboarding and payment are complete
     *
     * Sends two messages in order using queue system:
     * 1. Combined plan summary + first week breakdown
     * 2. First workout message
     *
     * @param user - The user to send messages to
     * @throws Error if any step fails
     */
    sendOnboardingMessages(user: UserWithProfile): Promise<void>;
    /**
     * Prepare combined plan + first week message
     * Combines pre-generated plan and microcycle messages into a single onboarding message
     */
    private prepareCombinedPlanMicrocycleMessage;
    /**
     * Prepare workout message
     */
    private prepareWorkoutMessage;
}
export declare const onboardingService: OnboardingService;
//# sourceMappingURL=onboardingService.d.ts.map