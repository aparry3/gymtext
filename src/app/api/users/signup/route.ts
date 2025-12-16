import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { userAuthService } from '@/server/services/auth/userAuthService';
import { userService } from '@/server/services';
import { onboardingDataService } from '@/server/services/user/onboardingDataService';
import { messageService } from '@/server/services';
import { inngest } from '@/server/connections/inngest/client';
import { SubscriptionRepository } from '@/server/repositories/subscriptionRepository';
import type { SignupData } from '@/server/repositories/onboardingRepository';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

/**
 * POST /api/users/signup
 *
 * Signup flow with support for existing users:
 * - New user: Create user, Stripe customer, onboarding, checkout
 * - Existing user (not subscribed): Update user, continue to Stripe checkout
 * - Existing user (subscribed): Update user, re-onboard, redirect to /me
 *
 * Response:
 * - success: boolean
 * - checkoutUrl?: string (for new/unsubscribed users)
 * - redirectUrl?: string (for subscribed users returning)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    console.log('[Signup] Form data:', formData);

    // Check for existing user by phone number
    const existingUser = await userService.getUserByPhone(formData.phoneNumber);

    if (existingUser) {
      const subscriptionRepo = new SubscriptionRepository();
      const hasActiveSub = await subscriptionRepo.hasActiveSubscription(existingUser.id);

      if (hasActiveSub) {
        // SCENARIO 2: Subscribed user - re-onboard and redirect to /me
        console.log(`[Signup] Existing subscribed user: ${existingUser.id}`);
        return await handleSubscribedUserReOnboard(existingUser, formData);
      } else {
        // SCENARIO 1: Unsubscribed user - update and continue to Stripe
        console.log(`[Signup] Existing unsubscribed user: ${existingUser.id}`);
        return await handleUnsubscribedUserSignup(existingUser, formData);
      }
    }

    // NEW USER: Standard signup flow
    console.log('[Signup] Creating new user');
    return await handleNewUserSignup(formData);
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

/**
 * Handle signup for a completely new user
 */
async function handleNewUserSignup(formData: Record<string, unknown>) {
  // Step 1: Create user (basic info only)
  console.log('[Signup] Creating user with basic info');
  const user = await userService.createUser({
    name: formData.name as string,
    phoneNumber: formData.phoneNumber as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
  });

  console.log(`[Signup] User created: ${user.id}`);

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

  // Continue with common flow
  return await completeSignupFlow(user.id, customer.id, formData, false);
}

/**
 * Handle signup for an existing user who is NOT subscribed
 * Updates user info and continues to Stripe checkout
 */
async function handleUnsubscribedUserSignup(
  existingUser: { id: string; stripeCustomerId: string | null; name: string; phoneNumber: string },
  formData: Record<string, unknown>
) {
  // Update existing user with new form data
  console.log('[Signup] Updating existing user info');
  await userService.updateUser(existingUser.id, {
    name: formData.name as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
  });

  // Handle Stripe customer - reuse if exists, create if not
  let customerId = existingUser.stripeCustomerId;
  if (!customerId) {
    console.log('[Signup] Creating Stripe customer for existing user');
    const customer = await stripe.customers.create({
      name: formData.name as string,
      phone: existingUser.phoneNumber,
      metadata: {
        userId: existingUser.id,
      },
    });
    customerId = customer.id;
    await userService.updateUser(existingUser.id, {
      stripeCustomerId: customerId,
    });
    console.log(`[Signup] Stripe customer created: ${customerId}`);
  } else {
    console.log(`[Signup] Reusing existing Stripe customer: ${customerId}`);
  }

  // Continue with common flow
  return await completeSignupFlow(existingUser.id, customerId, formData, false);
}

/**
 * Handle re-onboarding for an existing subscribed user
 * Creates fresh plan/profile/workout, skips Stripe, redirects to /me
 */
async function handleSubscribedUserReOnboard(
  existingUser: { id: string },
  formData: Record<string, unknown>
) {
  // Update user with new form data
  console.log('[Signup] Updating subscribed user info');
  await userService.updateUser(existingUser.id, {
    name: formData.name as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
  });

  // Reset onboarding record with new signup data
  console.log('[Signup] Resetting onboarding record');
  try {
    await onboardingDataService.delete(existingUser.id);
  } catch {
    // Ignore if no existing record
  }
  await onboardingDataService.createOnboardingRecord(existingUser.id, extractSignupData(formData));

  // Trigger async Inngest onboarding job with forceCreate flag
  console.log('[Signup] Triggering re-onboarding job with forceCreate');
  await inngest.send({
    name: 'user/onboarding.requested',
    data: {
      userId: existingUser.id,
      forceCreate: true,
    },
  });

  // Set session cookie and return redirect URL (no Stripe checkout)
  const sessionToken = userAuthService.createSessionToken(existingUser.id);

  const response = NextResponse.json({
    success: true,
    redirectUrl: '/me',
  });

  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  });

  console.log('[Signup] Subscribed user re-onboarding started, redirecting to /me');
  return response;
}

/**
 * Complete the signup flow common to new and unsubscribed existing users
 */
async function completeSignupFlow(
  userId: string,
  stripeCustomerId: string,
  formData: Record<string, unknown>,
  forceCreate: boolean
) {
  // Reset onboarding record if exists, create fresh
  console.log('[Signup] Creating onboarding record');
  try {
    await onboardingDataService.delete(userId);
  } catch {
    // Ignore if no existing record
  }
  await onboardingDataService.createOnboardingRecord(userId, extractSignupData(formData));

  // Send welcome SMS
  console.log('[Signup] Sending welcome SMS');
  const userWithProfile = await userService.getUser(userId);
  if (userWithProfile) {
    await messageService.sendWelcomeMessage(userWithProfile);
  }

  // Trigger async Inngest onboarding job
  console.log('[Signup] Triggering async onboarding job');
  await inngest.send({
    name: 'user/onboarding.requested',
    data: {
      userId,
      forceCreate,
    },
  });

  // Create Stripe checkout session
  console.log('[Signup] Creating Stripe checkout session');
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
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
      userId,
    },
    client_reference_id: userId,
  });

  console.log(`[Signup] Checkout session created: ${session.id}`);

  // Set session cookie and return checkout URL
  const sessionToken = userAuthService.createSessionToken(userId);

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
}

/**
 * Extract signup data from form data with proper typing
 */
function extractSignupData(formData: Record<string, unknown>): SignupData {
  return {
    primaryGoals: formData.primaryGoals as SignupData['primaryGoals'],
    goalsElaboration: formData.goalsElaboration as string | undefined,
    experienceLevel: formData.experienceLevel as SignupData['experienceLevel'],
    desiredDaysPerWeek: formData.desiredDaysPerWeek as SignupData['desiredDaysPerWeek'],
    availabilityElaboration: formData.availabilityElaboration as string | undefined,
    trainingLocation: formData.trainingLocation as SignupData['trainingLocation'],
    equipment: formData.equipment as string[],
    injuries: formData.injuries as string | undefined,
    acceptedRisks: formData.acceptedRisks as boolean,
  };
}
