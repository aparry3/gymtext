import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServices, type ServiceContainer } from '@/lib/context';
import { inngest } from '@/server/connections/inngest/client';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import { getStripeSecrets } from '@/server/config';
import { getStripeConfig, getUrlsConfig } from '@/shared/config';
import { isProductionEnvironment } from '@/shared/config/public';

const { secretKey } = getStripeSecrets();
const stripe = new Stripe(secretKey, {
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

    const services = getServices();

    // Check for existing user by phone number
    const existingUser = await services.user.getUserByPhone(formData.phoneNumber);

    if (existingUser) {
      const hasActiveSub = await services.subscription.hasActiveSubscription(existingUser.id);

      if (hasActiveSub) {
        // SCENARIO 2: Subscribed user - re-onboard and redirect to /me
        console.log(`[Signup] Existing subscribed user: ${existingUser.id}`);
        return await handleSubscribedUserReOnboard(services, existingUser, formData);
      } else {
        // SCENARIO 1: Unsubscribed user - update and continue to Stripe
        console.log(`[Signup] Existing unsubscribed user: ${existingUser.id}`);
        return await handleUnsubscribedUserSignup(services, existingUser, formData);
      }
    }

    // NEW USER: Standard signup flow
    console.log('[Signup] Creating new user');
    return await handleNewUserSignup(services, formData);
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
async function handleNewUserSignup(services: ServiceContainer, formData: Record<string, unknown>) {
  // Step 1: Create user (basic info only)
  console.log('[Signup] Creating user with basic info');
  const user = await services.user.createUser({
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
  await services.user.updateUser(user.id, {
    stripeCustomerId: customer.id,
  });

  console.log(`[Signup] Stripe customer created: ${customer.id}`);

  // Continue with common flow
  return await completeSignupFlow(services, user.id, customer.id, formData, false);
}

/**
 * Handle signup for an existing user who is NOT subscribed
 * Updates user info and continues to Stripe checkout
 */
async function handleUnsubscribedUserSignup(
  services: ServiceContainer,
  existingUser: { id: string; stripeCustomerId: string | null; name: string; phoneNumber: string },
  formData: Record<string, unknown>
) {
  // Update existing user with new form data
  console.log('[Signup] Updating existing user info');
  await services.user.updateUser(existingUser.id, {
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
    await services.user.updateUser(existingUser.id, {
      stripeCustomerId: customerId,
    });
    console.log(`[Signup] Stripe customer created: ${customerId}`);
  } else {
    console.log(`[Signup] Reusing existing Stripe customer: ${customerId}`);
  }

  // Continue with common flow
  return await completeSignupFlow(services, existingUser.id, customerId, formData, false);
}

/**
 * Handle re-onboarding for an existing subscribed user
 * Creates fresh plan/profile/workout, skips Stripe, redirects to /me
 */
async function handleSubscribedUserReOnboard(
  services: ServiceContainer,
  existingUser: { id: string },
  formData: Record<string, unknown>
) {
  // Update user with new form data
  console.log('[Signup] Updating subscribed user info');
  await services.user.updateUser(existingUser.id, {
    name: formData.name as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
  });

  // Reset onboarding record with new signup data
  console.log('[Signup] Resetting onboarding record');
  try {
    await services.onboardingData.delete(existingUser.id);
  } catch {
    // Ignore if no existing record
  }
  await services.onboardingData.createOnboardingRecord(existingUser.id, extractSignupData(formData));

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
  const sessionToken = services.userAuth.createSessionToken(existingUser.id);

  const response = NextResponse.json({
    success: true,
    redirectUrl: '/me',
  });

  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: isProductionEnvironment(),
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
  services: ServiceContainer,
  userId: string,
  stripeCustomerId: string,
  formData: Record<string, unknown>,
  forceCreate: boolean
) {
  // Reset onboarding record if exists, create fresh
  console.log('[Signup] Creating onboarding record');
  try {
    await services.onboardingData.delete(userId);
  } catch {
    // Ignore if no existing record
  }
  await services.onboardingData.createOnboardingRecord(userId, extractSignupData(formData));

  // Send Twilio-compliant welcome message
  console.log('[Signup] Sending welcome message');
  const userWithProfile = await services.user.getUser(userId);
  if (userWithProfile && userWithProfile.smsConsent) {
    try {
      // Queue single welcome message with Twilio-required disclosures
      await services.messagingOrchestrator.queueMessages(
        userWithProfile,
        [
          {
            content:
              "Welcome to GymText! Ready to transform your fitness? We'll be texting you daily workouts starting soon. Msg & data rates may apply. Reply STOP to opt out.",
          },
        ],
        'onboarding'
      );
      console.log('[Signup] Sent welcome message');
    } catch (error) {
      console.error('[Signup] Failed to send welcome message:', error);
      // Don't block signup if message sending fails
    }
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
  const { publicBaseUrl, baseUrl } = getUrlsConfig();
  const resolvedBaseUrl = publicBaseUrl || baseUrl;
  const { priceId } = getStripeConfig();

  // Handle referral code if present
  const referralCode = formData.referralCode as string | undefined;
  let validReferralCode: string | undefined;
  let refereeCouponId: string | undefined;

  if (referralCode) {
    console.log(`[Signup] Validating referral code: ${referralCode}`);
    const userWithProfile = await services.user.getUser(userId);
    const validation = await services.referral.validateReferralCode(
      referralCode,
      userWithProfile?.phoneNumber
    );

    if (validation.valid) {
      validReferralCode = referralCode.toUpperCase();
      // Get or create the referral coupon in Stripe
      refereeCouponId = await services.referral.getRefereeCouponId();
      console.log(`[Signup] Referral code valid, applying coupon: ${refereeCouponId}`);

      // Create the referral record now (credit applied later via webhook)
      await services.referral.completeReferral(validReferralCode, userId);
    } else {
      console.log(`[Signup] Referral code invalid: ${validation.error}`);
    }
  }

  // Build checkout session options
  const checkoutOptions: Stripe.Checkout.SessionCreateParams = {
    customer: stripeCustomerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${resolvedBaseUrl}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${resolvedBaseUrl}?canceled=true`,
    metadata: {
      userId,
      referralCode: validReferralCode || '',
    },
    client_reference_id: userId,
  };

  // Add discount if referral is valid, otherwise allow promo codes
  if (refereeCouponId) {
    checkoutOptions.discounts = [{ coupon: refereeCouponId }];
  } else {
    checkoutOptions.allow_promotion_codes = true;
  }

  const session = await stripe.checkout.sessions.create(checkoutOptions);

  console.log(`[Signup] Checkout session created: ${session.id}`);

  // Set session cookie and return checkout URL
  const sessionToken = services.userAuth.createSessionToken(userId);

  const response = NextResponse.json({
    success: true,
    checkoutUrl: session.url,
  });

  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: isProductionEnvironment(),
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
    // Fitness data (optional - may not be present for program signups)
    primaryGoals: formData.primaryGoals as SignupData['primaryGoals'],
    goalsElaboration: formData.goalsElaboration as string | undefined,
    experienceLevel: formData.experienceLevel as SignupData['experienceLevel'],
    desiredDaysPerWeek: formData.desiredDaysPerWeek as SignupData['desiredDaysPerWeek'],
    availabilityElaboration: formData.availabilityElaboration as string | undefined,
    trainingLocation: formData.trainingLocation as SignupData['trainingLocation'],
    equipment: formData.equipment as string[],
    injuries: formData.injuries as string | undefined,
    acceptedRisks: formData.acceptedRisks as boolean,

    // SMS consent
    smsConsent: formData.smsConsent as boolean | undefined,
    smsConsentedAt: formData.smsConsentedAt as string | undefined,

    // Program-specific data
    programId: formData.programId as string | undefined,
    programAnswers: formData.programAnswers as Record<string, string | string[]> | undefined,
  };
}
