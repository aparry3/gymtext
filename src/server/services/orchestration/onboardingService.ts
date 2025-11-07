import { UserWithProfile } from '../../models/userModel';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MessageService } from '../messaging/messageService';
import { DailyMessageService } from './dailyMessageService';
import { ProgressService } from '../training/progressService';
import { WorkoutInstanceService } from '../training/workoutInstanceService';
import { ConversationFlowBuilder } from '../flows/conversationFlowBuilder';
import { DateTime } from 'luxon';

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
  private progressService: ProgressService;
  private workoutInstanceService: WorkoutInstanceService;

  private constructor() {
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.messageService = MessageService.getInstance();
    this.dailyMessageService = DailyMessageService.getInstance();
    this.progressService = ProgressService.getInstance();
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

      const progress = await this.progressService.ensureUpToDateProgress(plan, user);
      if (!progress?.microcycle) {
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
      const targetDate = DateTime.now().setZone(user.timezone).startOf('day');
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
   * Send onboarding messages (plan + microcycle + workout)
   * Called after both onboarding and payment are complete
   *
   * Sends three pre-generated messages from stored entities.
   *
   * @param user - The user to send messages to
   * @throws Error if any step fails
   */
  public async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);

    try {
      // Send all three messages in sequence
      await this.sendPlanMessage(user);
      await this.sendMicrocycleMessage(user);
      await this.sendWorkoutMessage(user);

      console.log(`[Onboarding] Successfully sent all onboarding messages to ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Send pre-generated plan summary message
   */
  private async sendPlanMessage(user: UserWithProfile): Promise<void> {
    const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(user.id);
    if (!fitnessPlan) {
      throw new Error(`No fitness plan found for user ${user.id}`);
    }

    if (fitnessPlan.message) {
      // Split on \n\n in case there are multiple messages
      const messages = fitnessPlan.message.split('\n\n').filter(msg => msg.trim());
      for (const message of messages) {
        await this.messageService.sendMessage(user, message.trim());
        // Small delay between messages for proper ordering
        if (messages.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      console.log(`[Onboarding] Sent plan message to ${user.id}`);
    } else {
      console.warn(`[Onboarding] No plan message found for ${fitnessPlan.id}, skipping`);
    }
  }

  /**
   * Send pre-generated microcycle weekly message
   */
  private async sendMicrocycleMessage(user: UserWithProfile): Promise<void> {
    const plan = await this.fitnessPlanService.getCurrentPlan(user.id);
    if (!plan) {
      throw new Error(`No fitness plan found for user ${user.id}`);
    }

    const progress = await this.progressService.ensureUpToDateProgress(plan, user);
    const microcycle = progress?.microcycle;

    if (!microcycle) {
      throw new Error(`No microcycle found for user ${user.id}`);
    }

    if (microcycle.message) {
      await this.messageService.sendMessage(user, microcycle.message);
      console.log(`[Onboarding] Sent microcycle message to ${user.id}`);
    } else {
      console.warn(`[Onboarding] No microcycle message found for ${microcycle.id}, skipping`);
    }
  }

  /**
   * Send pre-generated workout message
   */
  private async sendWorkoutMessage(user: UserWithProfile): Promise<void> {
    const targetDate = DateTime.now().setZone(user.timezone).startOf('day');
    const workout = await this.dailyMessageService.getTodaysWorkout(user.id, targetDate.toJSDate());

    if (!workout) {
      throw new Error(`No workout found for user ${user.id} on ${targetDate.toISODate()}`);
    }

    if (workout.message) {
      await this.messageService.sendMessage(user, workout.message);
      console.log(`[Onboarding] Sent workout message to ${user.id}`);
    } else {
      console.warn(`[Onboarding] No workout message found for ${workout.id}, skipping`);
    }
  }

  /**
   * Complete onboarding flow for a new user (LEGACY)
   * This method is kept for backward compatibility but will be deprecated
   *
   * @param user - The user to onboard
   * @throws Error if any step fails
   * @deprecated Use createFitnessPlan(), createFirstMicrocycle(), createFirstWorkout() and sendOnboardingMessages() separately
   */
  public async onboardUser(user: UserWithProfile): Promise<void> {
    console.log(`Starting onboarding for user ${user.id}`);

    try {
      // Create conversation flow to track context
      const flow = new ConversationFlowBuilder();

      // Step 1: Send welcome message
      console.log(`[Onboarding] Sending welcome message to ${user.id}`);
      const welcomeMessage = await this.messageService.sendWelcomeMessage(user);
      flow.addMessage(welcomeMessage);

      // Step 2-4: Create entities (plan, microcycle, workout)
      await this.createFitnessPlan(user);
      await this.createFirstMicrocycle(user);
      await this.createFirstWorkout(user);

      // Step 5-7: Send onboarding messages
      await this.sendOnboardingMessages(user);

      console.log(`[Onboarding] Successfully completed onboarding for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to onboard user ${user.id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
