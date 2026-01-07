import Stripe from 'stripe';
import { getStripeSecrets } from '@/server/config';
import { getStripeConfig, getUrlsConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../repositories/factory';

const { secretKey } = getStripeSecrets();
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});

export interface CancelResult {
  success: boolean;
  periodEndDate?: Date;
  error?: string;
}

export interface ReactivateResult {
  success: boolean;
  reactivated: boolean;
  requiresNewSubscription: boolean;
  checkoutUrl?: string;
  error?: string;
}

/**
 * SubscriptionServiceInstance interface
 */
export interface SubscriptionServiceInstance {
  cancelSubscription(userId: string): Promise<CancelResult>;
  reactivateSubscription(userId: string): Promise<ReactivateResult>;
  shouldReceiveMessages(userId: string): Promise<boolean>;
  hasActiveSubscription(userId: string): Promise<boolean>;
}

/**
 * Create a SubscriptionService instance with injected repositories
 * Note: Stripe client is shared (reads from env at module load)
 */
export function createSubscriptionService(repos: RepositoryContainer): SubscriptionServiceInstance {
  const createResubscriptionSession = async (userId: string): Promise<ReactivateResult> => {
    try {
      const user = await repos.user.findById(userId);
      if (!user) {
        return { success: false, reactivated: false, requiresNewSubscription: true, error: 'User not found' };
      }

      const { publicBaseUrl, baseUrl } = getUrlsConfig();
      const resolvedBaseUrl = publicBaseUrl || baseUrl;
      const { priceId } = getStripeConfig();

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId || undefined,
        mode: 'subscription',
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${resolvedBaseUrl}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${resolvedBaseUrl}/`,
        metadata: { userId },
        client_reference_id: userId,
      });

      console.log(`[SubscriptionService] Created resubscription checkout session for user ${userId}`);

      return {
        success: true,
        reactivated: false,
        requiresNewSubscription: true,
        checkoutUrl: session.url || undefined,
      };
    } catch (error) {
      console.error('[SubscriptionService] Create checkout session failed:', error);
      return {
        success: false,
        reactivated: false,
        requiresNewSubscription: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  return {
    async cancelSubscription(userId: string): Promise<CancelResult> {
      try {
        const subscription = await repos.subscription.getActiveSubscription(userId);
        if (!subscription) {
          const subscriptions = await repos.subscription.findByClientId(userId);
          const pendingSub = subscriptions.find((s) => s.status === 'cancel_pending');
          if (pendingSub) {
            return {
              success: true,
              periodEndDate: new Date(pendingSub.currentPeriodEnd),
            };
          }
          return { success: false, error: 'No active subscription found' };
        }

        const stripeSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
          cancel_at_period_end: true,
        });

        await repos.subscription.scheduleCancellation(subscription.stripeSubscriptionId);

        console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} scheduled for cancellation`);

        return {
          success: true,
          periodEndDate: new Date(stripeSubscription.current_period_end * 1000),
        };
      } catch (error) {
        console.error('[SubscriptionService] Cancel failed:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async reactivateSubscription(userId: string): Promise<ReactivateResult> {
      try {
        const subscriptions = await repos.subscription.findByClientId(userId);
        const subscription = subscriptions[0];

        if (!subscription) {
          return await createResubscriptionSession(userId);
        }

        if (subscription.status === 'active') {
          return { success: true, reactivated: false, requiresNewSubscription: false };
        }

        if (subscription.status === 'cancel_pending') {
          try {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

            if (stripeSubscription.status === 'active' && stripeSubscription.cancel_at_period_end) {
              await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
                cancel_at_period_end: false,
              });

              await repos.subscription.reactivate(subscription.stripeSubscriptionId);

              console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} reactivated`);

              return { success: true, reactivated: true, requiresNewSubscription: false };
            }
          } catch (stripeError) {
            console.error('[SubscriptionService] Stripe reactivation failed:', stripeError);
          }
        }

        if (subscription.status === 'canceled' || subscription.status === 'cancel_pending') {
          return await createResubscriptionSession(userId);
        }

        return { success: false, reactivated: false, requiresNewSubscription: false, error: 'Unknown subscription state' };
      } catch (error) {
        console.error('[SubscriptionService] Reactivate failed:', error);
        return {
          success: false,
          reactivated: false,
          requiresNewSubscription: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async shouldReceiveMessages(userId: string): Promise<boolean> {
      const subscription = await repos.subscription.findActiveForMessaging(userId);
      return subscription !== null;
    },

    async hasActiveSubscription(userId: string): Promise<boolean> {
      return await repos.subscription.hasActiveSubscription(userId);
    },
  };
}

// =============================================================================
