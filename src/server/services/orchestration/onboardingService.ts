import { UserWithProfile } from '../../models/userModel';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MessageService } from '../messaging/messageService';
import { DailyMessageService } from './dailyMessageService';
import { ConversationFlowBuilder } from '../flows/conversationFlowBuilder';

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

  private constructor() {
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.messageService = MessageService.getInstance();
    this.dailyMessageService = DailyMessageService.getInstance();
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Create fitness plan and workout (without sending messages)
   * Used during async onboarding process
   *
   * @param user - The user to create plan for
   * @throws Error if any step fails
   */
  public async createProgramAndWorkout(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Creating fitness plan for ${user.id}`);

    try {
      // Create fitness plan
      await this.fitnessPlanService.createFitnessPlan(user);

      console.log(`[Onboarding] Successfully created program for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to create program for ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Send onboarding messages (plan summary + first workout)
   * Called after both onboarding and payment are complete
   *
   * Uses pre-generated messages stored on the fitness plan and workout entities.
   *
   * @param user - The user to send messages to
   * @throws Error if any step fails
   */
  public async sendOnboardingMessages(user: UserWithProfile): Promise<void> {
    console.log(`[Onboarding] Sending onboarding messages to ${user.id}`);

    try {
      // Get the fitness plan with pre-generated message
      const fitnessPlan = await this.fitnessPlanService.getCurrentPlan(user.id);
      if (!fitnessPlan) {
        throw new Error(`No fitness plan found for user ${user.id}`);
      }

      // Send plan summary using stored message
      console.log(`[Onboarding] Sending plan summary to ${user.id}`);
      if (fitnessPlan.message) {
        // Use pre-generated message (may contain multiple messages separated by \n\n)
        const messages = fitnessPlan.message.split('\n\n').filter(msg => msg.trim());
        for (const message of messages) {
          await this.messageService.sendMessage(user, message.trim());
          // Small delay between messages to ensure proper ordering
          if (messages.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      } else {
        console.warn(`[Onboarding] No pre-generated message found for fitness plan ${fitnessPlan.id}, skipping plan summary`);
      }

      // Send first daily workout (uses pre-generated message on workout instance)
      console.log(`[Onboarding] Sending first workout to ${user.id}`);
      await this.dailyMessageService.sendDailyMessage(user);

      console.log(`[Onboarding] Successfully sent onboarding messages to ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to send onboarding messages to ${user.id}:`, error);
      throw error;
    }
  }

  /**
   * Complete onboarding flow for a new user (LEGACY)
   * This method is kept for backward compatibility but will be deprecated
   *
   * @param user - The user to onboard
   * @throws Error if any step fails
   * @deprecated Use createProgramAndWorkout() and sendOnboardingMessages() separately
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

      // Step 2: Create fitness plan
      await this.createProgramAndWorkout(user);

      // Step 3 & 4: Send onboarding messages
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
