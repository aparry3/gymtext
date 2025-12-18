import Stripe from 'stripe';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { UserRepository } from '@/server/repositories/userRepository';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
 * SubscriptionService
 *
 * Manages subscription cancellation and reactivation via SMS commands (STOP/START)
 *
 * Status flow:
 * - 'active' -> user sends STOP -> 'cancel_pending' (messages stop, sub cancels at period end)
 * - 'cancel_pending' -> user sends START -> 'active' (reactivated)
 * - 'cancel_pending' -> period ends -> 'canceled' (handled by Stripe webhook)
 * - 'canceled' -> user sends START -> new checkout session required
 */
export class SubscriptionService {
  private static instance: SubscriptionService;
  private subscriptionRepo: SubscriptionRepository;
  private userRepo: UserRepository;

  private constructor() {
    this.subscriptionRepo = new SubscriptionRepository();
    this.userRepo = new UserRepository();
  }

  public static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  /**
   * Cancel user's subscription via STOP command
   * Sets cancel_at_period_end in Stripe and status to 'cancel_pending' locally
   * User keeps access but messages stop immediately
   */
  async cancelSubscription(userId: string): Promise<CancelResult> {
    try {
      // Get active subscription
      const subscription = await this.subscriptionRepo.getActiveSubscription(userId);
      if (!subscription) {
        // Check if already pending cancellation
        const subscriptions = await this.subscriptionRepo.findByClientId(userId);
        const pendingSub = subscriptions.find(s => s.status === 'cancel_pending');
        if (pendingSub) {
          return {
            success: true,
            periodEndDate: new Date(pendingSub.currentPeriodEnd),
          };
        }
        return { success: false, error: 'No active subscription found' };
      }

      // Cancel in Stripe (at period end)
      const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        { cancel_at_period_end: true }
      );

      // Update local DB to 'cancel_pending'
      await this.subscriptionRepo.scheduleCancellation(subscription.stripeSubscriptionId);

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
  }

  /**
   * Reactivate user's subscription via START command
   * If cancel_at_period_end was set, clears it and sets status back to 'active'
   * If fully canceled, returns checkout URL for new subscription
   */
  async reactivateSubscription(userId: string): Promise<ReactivateResult> {
    try {
      // Get user's most recent subscription
      const subscriptions = await this.subscriptionRepo.findByClientId(userId);
      const subscription = subscriptions[0]; // Most recent

      if (!subscription) {
        // No subscription history - need new subscription
        return await this.createResubscriptionSession(userId);
      }

      // If already active, nothing to do
      if (subscription.status === 'active') {
        return { success: true, reactivated: false, requiresNewSubscription: false };
      }

      // If cancel_pending, try to reactivate in Stripe
      if (subscription.status === 'cancel_pending') {
        try {
          // Check Stripe subscription state
          const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId
          );

          if (stripeSubscription.status === 'active' && stripeSubscription.cancel_at_period_end) {
            // Can reactivate by clearing cancel_at_period_end
            await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
              cancel_at_period_end: false,
            });

            // Update local DB
            await this.subscriptionRepo.reactivate(subscription.stripeSubscriptionId);

            console.log(`[SubscriptionService] Subscription ${subscription.stripeSubscriptionId} reactivated`);

            return { success: true, reactivated: true, requiresNewSubscription: false };
          }
        } catch (stripeError) {
          console.error('[SubscriptionService] Stripe reactivation failed:', stripeError);
          // Fall through to create new subscription
        }
      }

      // If canceled or Stripe reactivation failed, need new subscription
      if (subscription.status === 'canceled' || subscription.status === 'cancel_pending') {
        return await this.createResubscriptionSession(userId);
      }

      // Unknown state
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
  }

  /**
   * Check if user should receive messages
   * Only users with status='active' (not 'cancel_pending') receive messages
   */
  async shouldReceiveMessages(userId: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findActiveForMessaging(userId);
    return subscription !== null;
  }

  /**
   * Create a new checkout session for resubscription
   */
  private async createResubscriptionSession(userId: string): Promise<ReactivateResult> {
    try {
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return { success: false, reactivated: false, requiresNewSubscription: true, error: 'User not found' };
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

      const session = await stripe.checkout.sessions.create({
        customer: user.stripeCustomerId || undefined,
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        success_url: `${baseUrl}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/`,
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
  }
}

export const subscriptionService = SubscriptionService.getInstance();
