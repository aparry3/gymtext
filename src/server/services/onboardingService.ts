import { UserWithProfile } from '../models/userModel';
import { FitnessPlanService } from './fitnessPlanService';
import { MessageService } from './messageService';
import { DailyMessageService } from './dailyMessageService';

/**
 * OnboardingService
 *
 * Orchestrates the complete user onboarding flow:
 * 1. Send welcome message
 * 2. Create fitness plan
 * 3. Send plan summary
 * 4. Send first daily workout
 *
 * Responsibilities:
 * - Coordinate multiple services for onboarding
 * - Handle onboarding flow logic
 * - Ensure proper sequencing of onboarding steps
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
   * Complete onboarding flow for a new user
   *
   * @param user - The user to onboard
   * @throws Error if any step fails
   */
  public async onboardUser(user: UserWithProfile): Promise<void> {
    console.log(`Starting onboarding for user ${user.id}`);

    try {
      // Step 1: Send welcome message
      console.log(`[Onboarding] Sending welcome message to ${user.id}`);
      await this.messageService.sendWelcomeMessage(user);

      // Step 2: Create fitness plan
      console.log(`[Onboarding] Creating fitness plan for ${user.id}`);
      const fitnessPlan = await this.fitnessPlanService.createFitnessPlan(user);

      // Step 3: Send plan summary
      console.log(`[Onboarding] Sending plan summary to ${user.id}`);
      await this.messageService.sendPlanSummary(user, fitnessPlan);

      // Step 4: Send first daily workout
      console.log(`[Onboarding] Sending first workout to ${user.id}`);
      await this.dailyMessageService.sendDailyMessage(user);

      console.log(`[Onboarding] Successfully completed onboarding for ${user.id}`);
    } catch (error) {
      console.error(`[Onboarding] Failed to onboard user ${user.id}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
