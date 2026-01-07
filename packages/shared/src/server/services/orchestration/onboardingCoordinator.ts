import type { RepositoryContainer } from '../../repositories/factory';
import type { OnboardingDataServiceInstance } from '../user/onboardingDataService';
import type { UserServiceInstance } from '../user/userService';
import type { OnboardingServiceInstance } from './onboardingService';

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
}

/**
 * Create an OnboardingCoordinator instance with injected dependencies
 */
export function createOnboardingCoordinator(
  repos: RepositoryContainer,
  deps: OnboardingCoordinatorDeps
): OnboardingCoordinatorInstance {
  const { onboardingData: onboardingDataService, user: userService, onboarding: onboardingService } = deps;

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

        const hasActiveSub = await repos.subscription.hasActiveSubscription(userId);
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

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { onboardingDataService as deprecatedOnboardingDataService } from '@/server/services/user/onboardingDataService';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { userService as deprecatedUserService } from '@/server/services/user/userService';
import { OnboardingService } from './onboardingService';

/**
 * @deprecated Use createOnboardingCoordinator(repos, deps) instead
 */
export class OnboardingCoordinator {
  private static instance: OnboardingCoordinator;
  private subscriptionRepo: SubscriptionRepository;
  private onboardingService: OnboardingService;

  private constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
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
      const messagesSent = await deprecatedOnboardingDataService.hasMessagesSent(userId);
      if (messagesSent) {
        console.log(`[OnboardingCoordinator] Messages already sent for user ${userId}, skipping`);
        return false;
      }

      // Check 2: Onboarding complete?
      const onboarding = await deprecatedOnboardingDataService.findByClientId(userId);
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
      const user = await deprecatedUserService.getUser(userId);
      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Send onboarding messages (plan summary + first workout)
      await this.onboardingService.sendOnboardingMessages(user);

      // Mark as sent (idempotency flag)
      await deprecatedOnboardingDataService.markMessagesSent(userId);

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
