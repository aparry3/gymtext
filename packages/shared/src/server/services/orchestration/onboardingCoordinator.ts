import type { OnboardingDataServiceInstance } from '../domain/user/onboardingDataService';
import type { UserServiceInstance } from '../domain/user/userService';
import type { OnboardingServiceInstance } from './onboardingService';
import type { SubscriptionServiceInstance } from '../domain/subscription/subscriptionService';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * OnboardingCoordinatorInstance interface
 */
export interface OnboardingCoordinatorInstance {
  sendOnboardingMessages(userId: string): Promise<boolean>;
}

export interface OnboardingCoordinatorDeps {
  onboardingData: OnboardingDataServiceInstance;
  user: UserServiceInstance;
  onboarding: OnboardingServiceInstance;
  subscription: SubscriptionServiceInstance;
}

/**
 * Create an OnboardingCoordinator instance with injected dependencies
 */
export function createOnboardingCoordinator(
  deps: OnboardingCoordinatorDeps
): OnboardingCoordinatorInstance {
  const { onboardingData: onboardingDataService, user: userService, onboarding: onboardingService, subscription: subscriptionService } = deps;

  return {
    async sendOnboardingMessages(userId: string): Promise<boolean> {
      console.log(`[OnboardingCoordinator] Checking if ready to send messages for user ${userId}`);

      try {
        const messagesSent = await onboardingDataService.hasMessagesSent(userId);
        if (messagesSent) {
          console.log(`[OnboardingCoordinator] Messages already sent for user ${userId}, skipping`);
          return false;
        }

        const onboarding = await onboardingDataService.findByClientId(userId);
        if (!onboarding || onboarding.status !== 'completed') {
          console.log(`[OnboardingCoordinator] Onboarding not complete for user ${userId} (status: ${onboarding?.status}), waiting`);
          return false;
        }

        const hasActiveSub = await subscriptionService.hasActiveSubscription(userId);
        if (!hasActiveSub) {
          console.log(`[OnboardingCoordinator] No active subscription for user ${userId}, waiting`);
          return false;
        }

        console.log(`[OnboardingCoordinator] All conditions met, sending onboarding messages to user ${userId}`);

        const user = await userService.getUser(userId);
        if (!user) throw new Error(`User ${userId} not found`);

        await onboardingService.sendOnboardingMessages(user);
        await onboardingDataService.markMessagesSent(userId);

        console.log(`[OnboardingCoordinator] Successfully sent onboarding messages to user ${userId}`);
        return true;
      } catch (error) {
        console.error(`[OnboardingCoordinator] Error sending onboarding messages to user ${userId}:`, error);
        throw error;
      }
    },
  };
}

