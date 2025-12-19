import { UserWithProfile } from '../../models/userModel';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MessageService } from '../messaging/messageService';
import { DailyMessageService } from './dailyMessageService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { now, startOfDay, getDayOfWeek } from '@/shared/utils/date';
import { ProgressService } from '../training/progressService';
import { messagingAgentService } from '@/server/services/agents/messaging';
import { messageQueueService, type QueuedMessage } from '../messaging/messageQueueService';

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
export class OnboardingService {
  private static instance: OnboardingService;
  private fitnessPlanService: FitnessPlanService;
  private messageService: MessageService;
  private dailyMessageService: DailyMessageService;
  private workoutInstanceService: WorkoutInstanceService;
  private progressService: ProgressService;

  private constructor() {
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.messageService = MessageService.getInstance();
    this.dailyMessageService = DailyMessageService.getInstance();
    this.workoutInstanceService = WorkoutInstanceService.getInstance();
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Create fitness plan with pre-generated message
   * Step 1 of onboarding entity creation
   *
   * @param user - The user to create plan for
   * @throws Error if creation fails
   */
  public async createFitnessPlan(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Creating fitness plan for ${user.id}`);

    try {
      await this.fitnessPlanService.createFitnessPlan(user);
      console.log(`[Onboarding] Successfully created fitness plan for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to create fitness plan for ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Create first microcycle with pre-generated message
   * Step 2 of onboarding entity creation
   * Requires fitness plan to exist
   *
   * @param user - The user to create microcycle for
   * @throws Error if creation fails
   */
  public async createFirstMicrocycle(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Creating first microcycle for ${user.id}`);

    try {
      const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!plan) {
        throw new Error(`No fitness plan found for user ${user.id}`);
      }

      // Create first microcycle using date-based approach (for current week)
      const currentDate = now(user.timezone).toJSDate();
      const { microcycle } = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
      if (!microcycle) {
        throw new Error('Failed to create first microcycle');
      }

      console.log(`[Onboarding] Successfully created first microcycle for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to create first microcycle for ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Create first workout with pre-generated message
   * Step 3 of onboarding entity creation
   * Requires fitness plan and microcycle to exist
   *
   * @param user - The user to create workout for
   * @throws Error if creation fails
   */
  public async createFirstWorkout(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Creating first workout for ${user.id}`);

    try {
      const targetDate = now(user.timezone).startOf('day');
      const workout = await this.workoutInstanceService.generateWorkoutForDate(user, targetDate);

      if (!workout) {
        throw new Error('Failed to create first workout');
      }

      console.log(`[Onboarding] Successfully created first workout for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to create first workout for ${user.id}:`, error);
      throw error;
    }
  }

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
  public async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);

    try {
      // Prepare both messages
      const planMicrocycleMessage = await this.prepareCombinedPlanMicrocycleMessage(user);
      const workoutMessage = await this.prepareWorkoutMessage(user);

      // Enqueue both messages for ordered delivery
      const messages: QueuedMessage[] = [
        { content: planMicrocycleMessage },
        { content: workoutMessage }
      ];

      await messageQueueService.enqueueMessages(
        user.id,
        messages,
        'onboarding'
      );

      console.log(`[Onboarding] Successfully queued onboarding messages for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Prepare combined plan + first week message
   * Combines pre-generated plan and microcycle messages into a single onboarding message
   */
  private async prepareCombinedPlanMicrocycleMessage(user: UserWithProfile): Promise<string> {
    const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
    if (!plan) {
      throw new Error(`No fitness plan found for user ${user.id}`);
    }

    if (!plan.message) {
      throw new Error(`No plan message found for user ${user.id}`);
    }

    // Get current microcycle using date-based approach
    const currentDate = now(user.timezone).toJSDate();
    const { microcycle } = await this.progressService.getOrCreateMicrocycleForDate(user.id, plan, currentDate, user.timezone);
    if (!microcycle) {
      throw new Error(`No microcycle found for user ${user.id}`);
    }

    if (!microcycle.message) {
      throw new Error(`No microcycle message found for user ${user.id}`);
    }

    // Get current weekday for the user's timezone
    const currentWeekday = getDayOfWeek(undefined, user.timezone);

    // Generate combined message using messaging agent service
    const message = await messagingAgentService.generatePlanMicrocycleCombinedMessage(
      plan.message,
      microcycle.message,
      currentWeekday
    );

    console.log(`[Onboarding] Prepared combined plan+microcycle message for ${user.id}`);
    return message;
  }

  /**
   * Prepare workout message
   */
  private async prepareWorkoutMessage(user: UserWithProfile): Promise<string> {
    const targetDate = startOfDay(now(user.timezone).toJSDate(), user.timezone);
    const workout = await this.dailyMessageService.getTodaysWorkout(user.id, targetDate);

    if (!workout) {
      throw new Error(`No workout found for user ${user.id} on ${targetDate.toISOString()}`);
    }

    if (!workout.message) {
      throw new Error(`No workout message found for ${workout.id}`);
    }

    console.log(`[Onboarding] Prepared workout message for ${user.id}`);
    return workout.message;
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
