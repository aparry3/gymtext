import { UserWithProfile } from '../../models/userModel';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MessageService } from '../messaging/messageService';
import { DailyMessageService } from './dailyMessageService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { now, startOfDay } from '@/shared/utils/date';
import { ProgressService } from '../training/progressService';
import { createPlanMicrocycleCombinedAgent } from '@/server/agents';

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
   * Sends two messages:
   * 1. Combined plan summary + first week breakdown
   * 2. First workout message
   *
   * @param user - The user to send messages to
   * @throws Error if any step fails
   */
  public async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);

    try {
      // Send combined plan+microcycle message and workout message
      await this.sendCombinedPlanMicrocycleMessage(user);
      await this.sendWorkoutMessage(user);

      console.log(`[Onboarding] Successfully sent all onboarding messages to ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Send combined plan + first week message
   * Combines pre-generated plan and microcycle messages into a single onboarding message
   */
  private async sendCombinedPlanMicrocycleMessage(user: UserWithProfile): Promise<void> {
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

    // Generate combined message using agent with pre-generated messages
    const planMicrocycleCombinedAgent = createPlanMicrocycleCombinedAgent();
    const message = await planMicrocycleCombinedAgent.invoke({
      planMessage: plan.message,
      microcycleMessage: microcycle.message
    });

    // Send the combined message
    await this.messageService.sendMessage(user, message);
    console.log(`[Onboarding] Sent combined plan+microcycle message to ${user.id}`);
  }

  /**
   * Send pre-generated workout message
   */
  private async sendWorkoutMessage(user: UserWithProfile): Promise<void> {
    const targetDate = startOfDay(now(user.timezone).toJSDate(), user.timezone);
    const workout = await this.dailyMessageService.getTodaysWorkout(user.id, targetDate);

    if (!workout) {
      throw new Error(`No workout found for user ${user.id} on ${targetDate.toISOString()}`);
    }

    if (workout.message) {
      await this.messageService.sendMessage(user, workout.message);
      console.log(`[Onboarding] Sent workout message to ${user.id}`);
    } else {
      console.warn(`[Onboarding] No workout message found for ${workout.id}, skipping`);
    }
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
