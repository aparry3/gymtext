import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import { onboardingCoordinator } from '@/server/services/orchestration/onboardingCoordinator';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * GET /api/checkout/session
 *
 * Handles the redirect from Stripe checkout after successful payment.
 * This ensures a subscription record exists before redirecting to /me.
 *
 * Flow:
 * 1. Get session_id from query params
 * 2. Retrieve checkout session from Stripe
 * 3. Check if subscription exists in DB
 * 4. If not, create it (webhook backup)
 * 5. Try to send onboarding messages
 * 6. Redirect to /me
 */
export async function GET(req: NextRequest) {
  console.log('[Checkout Session] Processing redirect from Stripe');

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      console.error('[Checkout Session] Missing session_id parameter');
      return NextResponse.redirect(new URL('/me', req.nextUrl.origin));
    }

    // Retrieve the checkout session from Stripe
    console.log(`[Checkout Session] Retrieving session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Get userId from metadata
    const userId = session.metadata?.userId || session.client_reference_id;
    if (!userId) {
      console.error('[Checkout Session] No userId in session metadata');
      return NextResponse.redirect(new URL('/me', req.nextUrl.origin));
    }

    console.log(`[Checkout Session] Processing for user: ${userId}`);

    // Check if subscription exists in Stripe session
    if (!session.subscription) {
      console.error('[Checkout Session] No subscription in session');
      return NextResponse.redirect(new URL('/me', req.nextUrl.origin));
    }

    const subscriptionRepo = new SubscriptionRepository();

    // Check if subscription already exists in DB
    const existingSubscription = await subscriptionRepo.findByStripeId(
      session.subscription as string
    );

    if (existingSubscription) {
      console.log(
        `[Checkout Session] Subscription already exists: ${existingSubscription.id}`
      );
    } else {
      // Subscription doesn't exist - create it (webhook backup)
      console.log('[Checkout Session] Creating subscription record (webhook backup)');

      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await subscriptionRepo.create({
        clientId: userId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType: 'monthly', // TODO: Get from subscription price
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });

      console.log(`[Checkout Session] Subscription created for user ${userId}`);
    }

    // Try to send onboarding messages (if onboarding is complete)
    try {
      const sent = await onboardingCoordinator.sendOnboardingMessages(userId);
      if (sent) {
        console.log(`[Checkout Session] Onboarding messages sent to user ${userId}`);
      } else {
        console.log(
          `[Checkout Session] Waiting for onboarding to complete for user ${userId}`
        );
      }
    } catch (error) {
      // Don't fail the redirect if message sending fails
      console.error(`[Checkout Session] Failed to send messages for user ${userId}:`, error);
    }

    // Redirect to /me
    console.log('[Checkout Session] Redirecting to /me');
    return NextResponse.redirect(new URL('/me', req.nextUrl.origin));
  } catch (error) {
    console.error('[Checkout Session] Error processing session:', error);
    // Still redirect to /me even on error - user can retry or contact support
    return NextResponse.redirect(new URL('/me', req.nextUrl.origin));
  }
}
