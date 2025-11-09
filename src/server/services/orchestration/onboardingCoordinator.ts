import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import { OnboardingService } from './onboardingService';

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
export class OnboardingCoordinator {
  private static instance: OnboardingCoordinator;
  private subscriptionRepo: SubscriptionRepository;
  private userRepo: UserRepository;
  private onboardingService: OnboardingService;

  private constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
    this.userRepo = new UserRepository();
    this.onboardingService = OnboardingService.getInstance();
  }

  public static getInstance(): OnboardingCoordinator {
    if (!OnboardingCoordinator.instance) {
      OnboardingCoordinator.instance = new OnboardingCoordinator();
    }
    return OnboardingCoordinator.instance;
  }

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
  async sendOnboardingMessages(userId: string): Promise<boolean> {
    console.log(`[OnboardingCoordinator] Checking if ready to send messages for user ${userId}`);

    try {
      // Check 1: Messages already sent?
      const messagesSent = await onboardingDataService.hasMessagesSent(userId);
      if (messagesSent) {
        console.log(`[OnboardingCoordinator] Messages already sent for user ${userId}, skipping`);
        return false;
      }

      // Check 2: Onboarding complete?
      const onboarding = await onboardingDataService.findByUserId(userId);
      if (!onboarding || onboarding.status !== 'completed') {
        console.log(`[OnboardingCoordinator] Onboarding not complete for user ${userId} (status: ${onboarding?.status}), waiting`);
        return false;
      }

      // Check 3: Has active subscription?
      const hasActiveSub = await this.subscriptionRepo.hasActiveSubscription(userId);
      if (!hasActiveSub) {
        console.log(`[OnboardingCoordinator] No active subscription for user ${userId}, waiting`);
        return false;
      }

      // All conditions met! Send messages
      console.log(`[OnboardingCoordinator] All conditions met, sending onboarding messages to user ${userId}`);

      // Get user with profile
      const user = await this.userRepo.findWithProfile(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Send onboarding messages (plan summary + first workout)
      await this.onboardingService.sendOnboardingMessages(user);

      // Mark as sent (idempotency flag)
      await onboardingDataService.markMessagesSent(userId);

      console.log(`[OnboardingCoordinator] Successfully sent onboarding messages to user ${userId}`);
      return true;
    } catch (error) {
      console.error(`[OnboardingCoordinator] Error sending onboarding messages to user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const onboardingCoordinator = OnboardingCoordinator.getInstance();
