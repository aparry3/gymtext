import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServices, getRepositories, type ServiceContainer } from '@/lib/context';
import { inngest } from '@/server/connections/inngest/client';
import type { SignupData } from '@/server/repositories/onboardingRepository';
import { getStripeSecrets, getEnvironmentSettings } from '@/server/config';
import { getStripeConfig, getUrlsConfig, getProgramConfig } from '@/shared/config';
import { isProductionEnvironment } from '@/shared/config/public';
import { getAdminConfig } from '@gymtext/shared/shared';
import { buildAdminTestPhone } from '@gymtext/shared/shared/utils/phoneUtils';

const { secretKey } = getStripeSecrets();
const stripe = new Stripe(secretKey, {
  apiVersion: '2023-10-16',
});

function isLocalDev(): boolean {
  const settings = getEnvironmentSettings();
  if (settings.forceStripe) return false;
  return settings.isDevelopment;
}

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

    // Admin test signup: admin phone + program → create test user with suffixed phone, skip Stripe
    const { phoneNumbers: adminPhones } = getAdminConfig();
    if (adminPhones.includes(formData.phoneNumber as string) && formData.programId) {
      console.log('[Signup] Admin test signup detected');
      return await handleAdminTestSignup(services, formData);
    }

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
    email: formData.email as string,
    phoneNumber: formData.phoneNumber as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
    messagingOptIn: formData.smsConsent === true,
    messagingOptInDate: formData.smsConsent ? new Date() : null,
  });

  console.log(`[Signup] User created: ${user.id}`);

  // In dev mode, skip Stripe entirely
  if (isLocalDev()) {
    return await handleDevModeSignup(services, user.id, formData);
  }

  // Step 2: Create Stripe customer
  console.log('[Signup] Creating Stripe customer');
  const customer = await stripe.customers.create({
    name: user.name,
    email: formData.email as string,
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
    email: formData.email as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
    messagingOptIn: formData.smsConsent === true,
    messagingOptInDate: formData.smsConsent ? new Date() : null,
  });

  // In dev mode, skip Stripe entirely
  if (isLocalDev()) {
    return await handleDevModeSignup(services, existingUser.id, formData);
  }

  // Handle Stripe customer - reuse if exists, create if not
  let customerId = existingUser.stripeCustomerId;
  if (!customerId) {
    console.log('[Signup] Creating Stripe customer for existing user');
    const customer = await stripe.customers.create({
      name: formData.name as string,
      email: formData.email as string,
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
    email: formData.email as string,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: formData.gender as string | undefined,
    timezone: formData.timezone as string,
    preferredSendHour: formData.preferredSendHour as number,
    messagingOptIn: formData.smsConsent === true,
    messagingOptInDate: formData.smsConsent ? new Date() : null,
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
 * Handle signup in dev mode — skip Stripe, create test subscription directly
 */
async function handleDevModeSignup(
  services: ServiceContainer,
  userId: string,
  formData: Record<string, unknown>
) {
  console.log('[Signup] Dev mode — skipping Stripe, creating test subscription');

  // Create onboarding record
  try {
    await services.onboardingData.delete(userId);
  } catch {
    // Ignore if no existing record
  }
  await services.onboardingData.createOnboardingRecord(userId, extractSignupData(formData));

  // Create test subscription directly via repository
  const repos = getRepositories();
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  await repos.subscription.create({
    clientId: userId,
    stripeSubscriptionId: `sub_test_${Date.now()}`,
    status: 'active',
    planType: 'monthly',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });

  console.log('[Signup] Test subscription created');

  // Enroll in program BEFORE sending welcome so brand/image resolve correctly
  await ensureEnrollment(services, userId, formData);

  // Send welcome message if user consented to SMS
  if (formData.smsConsent) {
    const userWithProfile = await services.user.getUser(userId);
    if (userWithProfile) {
      await services.onboarding.sendWelcomeMessage(userWithProfile);
    }
  }

  // Trigger async onboarding job
  console.log('[Signup] Triggering async onboarding job');
  await inngest.send({
    name: 'user/onboarding.requested',
    data: { userId, forceCreate: false },
  });

  // Set session cookie and return redirect URL
  const sessionToken = services.userAuth.createSessionToken(userId);

  const response = NextResponse.json({
    success: true,
    redirectUrl: '/me',
  });

  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: false, // Dev mode
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  console.log('[Signup] Dev mode signup complete, redirecting to /me');
  return response;
}

/**
 * Handle signup for an admin test user.
 * Admin uses the normal signup form with their real phone — backend creates a
 * suffixed test user identity, skips Stripe, and triggers onboarding.
 * If a test user already exists for this program, it's fully reset (deleted + re-created).
 */
async function handleAdminTestSignup(
  services: ServiceContainer,
  formData: Record<string, unknown>
) {
  const repos = getRepositories();
  const programId = formData.programId as string;

  // Look up program for the slug
  const program = await repos.program.findById(programId);
  if (!program) {
    return NextResponse.json({ success: false, message: 'Program not found' }, { status: 404 });
  }

  const slug = program.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const testPhone = buildAdminTestPhone(formData.phoneNumber as string, slug);

  // If test user already exists for this program, full reset
  const existing = await repos.user.findByPhoneNumber(testPhone);
  if (existing) {
    console.log(`[Signup] Admin test user exists for "${program.name}", resetting`);
    // Clear active test routing if this was the active user
    const activeTestUserId = await repos.adminTestRouting.getActiveTestUserId(formData.phoneNumber as string);
    if (activeTestUserId === existing.id) {
      await repos.adminTestRouting.clearActiveTestUser(formData.phoneNumber as string);
    }
    await services.user.deleteUser(existing.id);
  }

  // Create user via service (validates suffixed phones via getBasePhone)
  const user = await services.user.createUser({
    name: (formData.name as string) || `Test - ${program.name}`,
    phoneNumber: testPhone,
    email: formData.email ? `${(formData.email as string).replace('@', `+${slug}@`)}` : undefined,
    age: formData.age ? parseInt(formData.age as string, 10) : undefined,
    gender: (formData.gender as string) || undefined,
    timezone: (formData.timezone as string) || 'America/New_York',
    preferredSendHour: (formData.preferredSendHour as number) ?? 8,
    messagingOptIn: formData.smsConsent === true,
    messagingOptInDate: formData.smsConsent ? new Date() : null,
  });

  if (!user) {
    return NextResponse.json({ success: false, message: 'Failed to create test user' }, { status: 500 });
  }

  console.log(`[Signup] Admin test user created: ${user.id} (${testPhone})`);

  // Create test subscription (no Stripe)
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setFullYear(periodEnd.getFullYear() + 1);

  await repos.subscription.create({
    clientId: user.id,
    stripeSubscriptionId: `sub_test_${Date.now()}`,
    status: 'active',
    planType: 'monthly',
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  });

  // Create onboarding record and trigger onboarding
  await services.onboardingData.createOnboardingRecord(user.id, extractSignupData(formData));

  // Enroll in program BEFORE sending welcome so brand/image resolve correctly
  await ensureEnrollment(services, user.id, formData);

  // Send welcome message if user consented to SMS
  if (formData.smsConsent) {
    const userWithProfile = await services.user.getUser(user.id);
    if (userWithProfile) {
      await services.onboarding.sendWelcomeMessage(userWithProfile);
    }
  }

  await inngest.send({
    name: 'user/onboarding.requested',
    data: { userId: user.id, forceCreate: false },
  });

  // Set session cookie and return redirect (no checkout)
  const sessionToken = services.userAuth.createSessionToken(user.id);

  const response = NextResponse.json({
    success: true,
    redirectUrl: '/me',
  });

  response.cookies.set('gt_user_session', sessionToken, {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });

  console.log(`[Signup] Admin test signup complete for "${program.name}", redirecting to /me`);
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

  // Enroll in program BEFORE sending welcome so brand/image resolve correctly
  await ensureEnrollment(services, userId, formData);

  // Send Twilio-compliant welcome message if user consented to SMS
  console.log('[Signup] smsConsent:', formData.smsConsent);
  if (formData.smsConsent) {
    const userWithProfile = await services.user.getUser(userId);
    if (userWithProfile) {
      await services.onboarding.sendWelcomeMessage(userWithProfile);
    } else {
      console.error(`[Signup] Could not fetch user ${userId} for welcome message`);
    }
  } else {
    console.log('[Signup] Skipping welcome message - no SMS consent');
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
  const { priceId: globalPriceId } = getStripeConfig();

  // Use program-specific price if available, otherwise fall back to global default
  const programId = formData.programId as string | undefined;
  let priceId = globalPriceId;

  if (programId) {
    try {
      const repos = getRepositories();
      const program = await repos.program.findById(programId);
      if (program?.stripePriceId) {
        priceId = program.stripePriceId;
        console.log(`[Signup] Using program-specific price: ${priceId} (program: ${program.name})`);
      }
    } catch (err) {
      console.error(`[Signup] Error fetching program ${programId} for pricing, using global default:`, err);
    }
  }

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

  // Handle promo code if present and no valid referral
  let stripePromotionCodeId: string | undefined;
  const promoCode = formData.promoCode as string | undefined;
  if (!refereeCouponId && promoCode) {
    console.log(`[Signup] Validating promo code: ${promoCode}`);
    const promoValidation = await services.promoCode.validatePromoCode(promoCode);
    if (promoValidation.valid && promoValidation.stripePromotionCodeId) {
      stripePromotionCodeId = promoValidation.stripePromotionCodeId;
      console.log(`[Signup] Promo code valid, applying Stripe promotion code: ${stripePromotionCodeId}`);
    } else {
      console.log(`[Signup] Promo code invalid: ${promoValidation.error}`);
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
      programId: programId || '',
    },
    client_reference_id: userId,
  };

  // Add discount: referral coupon > promo code > allow manual entry
  if (refereeCouponId) {
    checkoutOptions.discounts = [{ coupon: refereeCouponId }];
  } else if (stripePromotionCodeId) {
    checkoutOptions.discounts = [{ promotion_code: stripePromotionCodeId }];
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
 * Ensure the user is enrolled in a program before welcome messages are sent.
 *
 * Mirrors the enrollment logic in onboardingSteps.ts Step 3. Safe to call
 * before the Inngest onboarding job runs — Step 3 will see the active
 * enrollment and reuse it. Without this, `sendWelcomeMessage` can't resolve
 * the program brand/image and falls back to the default GymText welcome.
 */
async function ensureEnrollment(
  services: ServiceContainer,
  userId: string,
  formData: Record<string, unknown>
): Promise<void> {
  try {
    const existing = await services.enrollment.getActiveEnrollment(userId);
    if (existing) return;

    const programId =
      (formData.programId as string | undefined) || getProgramConfig().defaultProgramId;
    if (!programId) {
      console.warn('[Signup] No programId in form data and DEFAULT_PROGRAM_ID not configured — skipping pre-welcome enrollment');
      return;
    }

    const program = await services.program.getById(programId);
    if (!program) {
      console.warn(`[Signup] Program ${programId} not found — skipping pre-welcome enrollment`);
      return;
    }

    console.log(`[Signup] Creating pre-welcome enrollment for ${userId} (program: ${program.id})`);
    await services.enrollment.enrollClient(userId, program.id);
  } catch (error) {
    // Don't block signup if enrollment fails — Inngest Step 3 will retry
    console.error(`[Signup] Pre-welcome enrollment failed for ${userId}:`, error);
  }
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
    experienceElaboration: formData.experienceElaboration as string | undefined,
    desiredDaysPerWeek: formData.desiredDaysPerWeek as SignupData['desiredDaysPerWeek'],
    availabilityElaboration: formData.availabilityElaboration as string | undefined,
    trainingLocation: formData.trainingLocation as SignupData['trainingLocation'],
    locationElaboration: formData.locationElaboration as string | undefined,
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
