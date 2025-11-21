import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { userAuthService } from '@/server/services/auth/userAuthService';
import { userService } from '@/server/services';
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { messageService } from '@/server/services';
import { inngest } from '@/server/connections/inngest/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * POST /api/users/signup
 *
 * New optimized signup flow:
 * 1. Create user (basic info only, no LLM)
 * 2. Create Stripe customer
 * 3. Create onboarding record with raw signup data
 * 4. Send welcome SMS
 * 5. Trigger async Inngest onboarding job (don't wait!)
 * 6. Create Stripe checkout session
 * 7. Return checkout URL
 *
 * Note: All form data is stored raw. Formatting for LLM happens
 * in the backend during async onboarding (signupDataFormatter service).
 *
 * Response:
 * - success: boolean
 * - checkoutUrl: string
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();

    console.log('[Signup] Form data:', formData);
    // Step 1: Create user (basic info only)
    console.log('[Signup] Creating user with basic info');
    const user = await userService.createUser({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      gender: formData.gender,
      timezone: formData.timezone,
      preferredSendHour: formData.preferredSendHour,
    });

    console.log(`[Signup] User created: ${user}`);

    // Step 2: Create Stripe customer
    console.log('[Signup] Creating Stripe customer');
    const customer = await stripe.customers.create({
      name: user.name,
      phone: user.phoneNumber,
      metadata: {
        userId: user.id,
      },
    });

    // Update user with Stripe customer ID
    await userService.updateUser(user.id, {
      stripeCustomerId: customer.id,
    });

    console.log(`[Signup] Stripe customer created: ${customer.id}`);

    // Step 3: Create onboarding record with ALL raw signup data
    console.log('[Signup] Creating onboarding record');
    await onboardingDataService.createOnboardingRecord(user.id, {
      // Store ALL raw form data - formatting happens later in the backend
      primaryGoals: formData.primaryGoals,
      goalsElaboration: formData.goalsElaboration,
      experienceLevel: formData.experienceLevel,
      currentActivity: formData.currentActivity,
      activityElaboration: formData.activityElaboration,
      trainingLocation: formData.trainingLocation,
      equipment: formData.equipment,
      injuries: formData.injuries,
      acceptedRisks: formData.acceptedRisks,
    });

    // Step 4: Send welcome SMS
    console.log('[Signup] Sending welcome SMS');
    const userWithProfile = await userService.getUser(user.id);
    if (userWithProfile) {
      await messageService.sendWelcomeMessage(userWithProfile);
    }

    // Step 5: Trigger async Inngest onboarding job (fire and forget!)
    console.log('[Signup] Triggering async onboarding job');
    await inngest.send({
      name: 'user/onboarding.requested',
      data: {
        userId: user.id,
      },
    });

    // Step 6: Create Stripe checkout session
    console.log('[Signup] Creating Stripe checkout session');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?canceled=true`,
      metadata: {
        userId: user.id,
      },
      client_reference_id: user.id,
    });

    console.log(`[Signup] Checkout session created: ${session.id}`);

    // Step 7: Set session cookie and return checkout URL
    const sessionToken = userAuthService.createSessionToken(user.id);

    const response = NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });

    response.cookies.set('gt_user_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Signup] Error in signup API:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
