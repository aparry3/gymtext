import Stripe from 'stripe';
import { getStripeSecrets } from '@/server/config';
import { getStripeConfig, getUrlsConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../../repositories/factory';
import {
  STOP_CONFIRMATION,
  STOP_ALREADY_INACTIVE,
  STOP_ERROR,
  START_REACTIVATED,
  START_ALREADY_ACTIVE,
  START_REQUIRES_NEW_SUB,
  START_ERROR,
} from '../../orchestration/messagingConstants';

const { secretKey } = getStripeSecrets();
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});

export interface CancelResult {
  success: boolean;
  periodEndDate?: Date;
  error?: string;
}

export interface ImmediateCancelResult {
  success: boolean;
  canceledAt?: Date;
  error?: string;
}

export interface ReactivateResult {
  success: boolean;
  reactivated: boolean;
  requiresNewSubscription: boolean;
  checkoutUrl?: string;
  error?: string;
}

export interface ProcessUnsubscribeResult {
  success: boolean;
  alreadyInactive: boolean;
  responseMessage: string;
  periodEndDate?: Date;
}

export interface ProcessResubscribeResult {
  success: boolean;
  responseMessage: string;
  reactivated: boolean;
  requiresNewSubscription: boolean;
  checkoutUrl?: string;
}

/**
 * SubscriptionServiceInstance interface
 */
export type SubscriptionStatus = 'active' | 'cancel_pending' | 'canceled' | 'none';

export interface SubscriptionServiceInstance {
  cancelSubscription(userId: string): Promise<CancelResult>;
  immediatelyCancelSubscription(userId: string): Promise<ImmediateCancelResult>;
  reactivateSubscription(userId: string): Promise<ReactivateResult>;
  processUnsubscribe(userId: string): Promise<ProcessUnsubscribeResult>;
  processResubscribe(userId: string): Promise<ProcessResubscribeResult>;
  shouldReceiveMessages(userId: string): Promise<boolean>;
  hasActiveSubscription(userId: string): Promise<boolean>;
  getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>;
}

function isNonStripeSubscription(stripeSubscriptionId: string): boolean {
  return stripeSubscriptionId.startsWith('sub_test_') || stripeSubscriptionId.startsWith('free_legacy_');
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
      const { priceId: globalPriceId } = getStripeConfig();

      // Check if user is enrolled in a program with a specific price
      let priceId = globalPriceId;
      try {
        const enrollment = await repos.programEnrollment.findActiveByClientId(userId);
        if (enrollment) {
          const program = await repos.program.findById(enrollment.programId);
          if (program?.stripePriceId) {
            priceId = program.stripePriceId;
            console.log(`[SubscriptionService] Using program-specific price: ${priceId}`);
          }
        }
      } catch (err) {
        console.error('[SubscriptionService] Error fetching program pricing, using global default:', err);
      }

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

  const service: SubscriptionServiceInstance = {
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

        if (isNonStripeSubscription(subscription.stripeSubscriptionId)) {
          console.log(`[SubscriptionService] Non-Stripe subscription ${subscription.stripeSubscriptionId} - skipping Stripe, updating local DB`);
          await repos.subscription.scheduleCancellation(subscription.stripeSubscriptionId);
          return {
            success: true,
            periodEndDate: new Date(subscription.currentPeriodEnd),
          };
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

    async immediatelyCancelSubscription(userId: string): Promise<ImmediateCancelResult> {
      try {
        // Find active or cancel_pending subscription
        const subscriptions = await repos.subscription.findByClientId(userId);
        const subscription = subscriptions.find(
          (s) => s.status === 'active' || s.status === 'cancel_pending'
        );

        if (!subscription) {
          // No subscription to cancel - treat as success for cleanup scenarios
          console.log(`[SubscriptionService] No active subscription found for user ${userId}, treating as success`);
          return { success: true };
        }

        const canceledAt = new Date();
        if (isNonStripeSubscription(subscription.stripeSubscriptionId)) {
          console.log(`[SubscriptionService] Non-Stripe subscription ${subscription.stripeSubscriptionId} - skipping Stripe, updating local DB`);
        } else {
          // Immediately cancel in Stripe (with prorated refund by default)
          await stripe.subscriptions.cancel(
            subscription.stripeSubscriptionId,
            { prorate: true }
          );
        }

        // Update local DB
        await repos.subscription.cancel(subscription.stripeSubscriptionId, canceledAt);

        console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} immediately canceled for user ${userId}`);

        return {
          success: true,
          canceledAt,
        };
      } catch (error) {
        console.error('[SubscriptionService] Immediate cancel failed:', error);
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
          if (isNonStripeSubscription(subscription.stripeSubscriptionId)) {
            console.log(`[SubscriptionService] Non-Stripe subscription ${subscription.stripeSubscriptionId} - skipping Stripe, reactivating locally`);
            await repos.subscription.reactivate(subscription.stripeSubscriptionId);
            return { success: true, reactivated: true, requiresNewSubscription: false };
          }

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

    async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
      const subscriptions = await repos.subscription.findByClientId(userId);
      if (subscriptions.length === 0) return 'none';
      const status = subscriptions[0].status;
      if (status === 'active' || status === 'cancel_pending' || status === 'canceled') return status;
      return 'none';
    },

    async processUnsubscribe(userId: string): Promise<ProcessUnsubscribeResult> {
      const user = await repos.user.findById(userId);
      if (!user) {
        return { success: false, alreadyInactive: false, responseMessage: STOP_ERROR };
      }

      if (!user.messagingOptIn) {
        return { success: true, alreadyInactive: true, responseMessage: STOP_ALREADY_INACTIVE };
      }

      await repos.user.update(userId, {
        messagingOptIn: false,
        messagingOptInDate: null,
      });

      const result = await service.cancelSubscription(userId);

      if (result.success && result.periodEndDate) {
        const formattedDate = result.periodEndDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        });
        return {
          success: true,
          alreadyInactive: false,
          responseMessage: STOP_CONFIRMATION.replace('{periodEndDate}', formattedDate),
          periodEndDate: result.periodEndDate,
        };
      } else if (result.error === 'No active subscription found') {
        return { success: true, alreadyInactive: false, responseMessage: STOP_ALREADY_INACTIVE };
      } else {
        return { success: false, alreadyInactive: false, responseMessage: STOP_ERROR };
      }
    },

    async processResubscribe(userId: string): Promise<ProcessResubscribeResult> {
      const result = await service.reactivateSubscription(userId);

      if (result.success && result.reactivated) {
        await repos.user.update(userId, {
          messagingOptIn: true,
          messagingOptInDate: new Date(),
        });
        return {
          success: true,
          responseMessage: START_REACTIVATED,
          reactivated: true,
          requiresNewSubscription: false,
        };
      } else if (result.requiresNewSubscription && result.checkoutUrl) {
        return {
          success: true,
          responseMessage: START_REQUIRES_NEW_SUB.replace('{checkoutUrl}', result.checkoutUrl),
          reactivated: false,
          requiresNewSubscription: true,
          checkoutUrl: result.checkoutUrl,
        };
      } else if (result.success && !result.requiresNewSubscription && !result.reactivated) {
        return {
          success: true,
          responseMessage: START_ALREADY_ACTIVE,
          reactivated: false,
          requiresNewSubscription: false,
        };
      } else {
        return {
          success: false,
          responseMessage: START_ERROR,
          reactivated: false,
          requiresNewSubscription: false,
        };
      }
    },
  };

  return service;
}

// =============================================================================
