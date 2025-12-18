import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { onboardingCoordinator } from '@/server/services/orchestration/onboardingCoordinator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for subscription management
 *
 * Events handled:
 * - checkout.session.completed: Create subscription, trigger final onboarding messages
 * - customer.subscription.updated: Update subscription status
 * - customer.subscription.deleted: Mark subscription as canceled
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('[Stripe Webhook] Missing stripe-signature header');
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}` },
        { status: 400 }
      );
    }

    console.log(`[Stripe Webhook] Received event: ${event.type}`);

    const subscriptionRepo = new SubscriptionRepository();

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`[Stripe Webhook] Checkout session completed:`, session.id);

        // Get userId from metadata
        const userId = session.metadata?.userId || session.client_reference_id;
        if (!userId) {
          console.error('[Stripe Webhook] No userId in session metadata');
          return NextResponse.json({ error: 'No userId in metadata' }, { status: 400 });
        }

        // Get subscription from Stripe
        if (!session.subscription) {
          console.error('[Stripe Webhook] No subscription in session');
          return NextResponse.json({ error: 'No subscription in session' }, { status: 400 });
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Create subscription record
        await subscriptionRepo.create({
          clientId: userId,
          stripeSubscriptionId: subscription.id,
          status: subscription.status,
          planType: 'monthly', // TODO: Get from subscription price
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        console.log(`[Stripe Webhook] Subscription created for user ${userId}`);

        // Try to send onboarding messages (if onboarding is complete)
        try {
          const sent = await onboardingCoordinator.sendOnboardingMessages(userId);
          if (sent) {
            console.log(`[Stripe Webhook] Onboarding messages sent to user ${userId}`);
          } else {
            console.log(`[Stripe Webhook] Waiting for onboarding to complete for user ${userId}`);
          }
        } catch (error) {
          // Don't fail the webhook if message sending fails
          console.error(`[Stripe Webhook] Failed to send messages for user ${userId}:`, error);
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Subscription updated:`, subscription.id);

        // Determine local status based on Stripe status and cancel_at_period_end
        // If Stripe status is 'active' but cancel_at_period_end is true, use 'cancel_pending'
        let localStatus: string = subscription.status;
        if (subscription.status === 'active' && subscription.cancel_at_period_end) {
          localStatus = 'cancel_pending';
        }

        // Update subscription record
        await subscriptionRepo.updateByStripeId(subscription.id, {
          status: localStatus,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        });

        console.log(`[Stripe Webhook] Subscription ${subscription.id} updated to status: ${localStatus} (Stripe: ${subscription.status}, cancel_at_period_end: ${subscription.cancel_at_period_end})`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe Webhook] Subscription deleted:`, subscription.id);

        // Mark subscription as canceled
        await subscriptionRepo.cancel(
          subscription.id,
          new Date(subscription.canceled_at! * 1000)
        );

        console.log(`[Stripe Webhook] Subscription ${subscription.id} marked as canceled`);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Stripe Webhook] Error processing webhook:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error processing webhook',
      },
      { status: 500 }
    );
  }
}
