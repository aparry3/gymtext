import Stripe from 'stripe';
import { getUrlsConfig } from '@/shared/config';
import {
  ReferralStats,
  MAX_REFERRAL_CREDITS,
  REFERRAL_CREDIT_AMOUNT_CENTS,
} from '@/server/models/referral';
import type { RepositoryContainer } from '../../../repositories/factory';

// Stripe coupon ID for referee's first month free
const REFERRAL_COUPON_ID = 'REFERRAL_FREE_MONTH';

export interface ValidateReferralResult {
  valid: boolean;
  referrerId?: string;
  referrerName?: string;
  error?: string;
}

export interface CreditReferrerResult {
  success: boolean;
  creditId?: string;
  error?: string;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * ReferralServiceInstance interface
 *
 * Defines all public methods available on the referral service.
 */
export interface ReferralServiceInstance {
  getOrCreateReferralCode(userId: string): Promise<string | null>;
  getReferralStats(userId: string): Promise<ReferralStats | null>;
  validateReferralCode(code: string, signupPhone?: string): Promise<ValidateReferralResult>;
  completeReferral(referralCode: string, refereeUserId: string): Promise<void>;
  creditReferrer(refereeUserId: string): Promise<CreditReferrerResult>;
  getRefereeCouponId(): Promise<string>;
  canEarnCredits(userId: string): Promise<boolean>;
}

export interface ReferralServiceDeps {
  stripeClient: Stripe;
}

/**
 * Create a ReferralService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @param deps - External dependencies (stripeClient)
 * @returns ReferralServiceInstance
 */
export function createReferralService(
  repos: RepositoryContainer,
  deps: ReferralServiceDeps
): ReferralServiceInstance {
  const { stripeClient } = deps;

  return {
    async getOrCreateReferralCode(userId: string): Promise<string | null> {
      return repos.user.getOrCreateReferralCode(userId);
    },

    async getReferralStats(userId: string): Promise<ReferralStats | null> {
      const referralCode = await repos.user.getOrCreateReferralCode(userId);
      if (!referralCode) {
        return null;
      }

      const { publicBaseUrl, baseUrl } = getUrlsConfig();
      const resolvedBaseUrl = publicBaseUrl || baseUrl;
      const referralLink = `${resolvedBaseUrl}/r/${referralCode}`;

      const completedReferrals = await repos.referral.countByReferrer(userId);
      const creditsEarned = await repos.referral.countCreditsEarned(userId);
      const creditsRemaining = Math.max(0, MAX_REFERRAL_CREDITS - creditsEarned);

      return {
        referralCode,
        referralLink,
        completedReferrals,
        creditsEarned,
        creditsRemaining,
      };
    },

    async validateReferralCode(
      code: string,
      signupPhone?: string
    ): Promise<ValidateReferralResult> {
      if (!code || code.length !== 6) {
        return { valid: false, error: 'Invalid referral code format' };
      }

      const referrer = await repos.user.findByReferralCode(code.toUpperCase());
      if (!referrer) {
        return { valid: false, error: 'Referral code not found' };
      }

      if (signupPhone && referrer.phoneNumber === signupPhone) {
        return { valid: false, error: 'Cannot use your own referral code' };
      }

      return {
        valid: true,
        referrerId: referrer.id,
        referrerName: referrer.name,
      };
    },

    async completeReferral(
      referralCode: string,
      refereeUserId: string
    ): Promise<void> {
      const referrer = await repos.user.findByReferralCode(referralCode.toUpperCase());
      if (!referrer) {
        console.error(`[ReferralService] Cannot complete referral: code ${referralCode} not found`);
        return;
      }

      const alreadyReferred = await repos.referral.hasBeenReferred(refereeUserId);
      if (alreadyReferred) {
        console.log(`[ReferralService] User ${refereeUserId} has already been referred, skipping`);
        return;
      }

      await repos.referral.create(referrer.id, refereeUserId);
      console.log(`[ReferralService] Referral completed: ${referrer.id} -> ${refereeUserId}`);
    },

    async creditReferrer(refereeUserId: string): Promise<CreditReferrerResult> {
      const referral = await repos.referral.findByRefereeId(refereeUserId);
      if (!referral) {
        console.log(`[ReferralService] No referral found for referee ${refereeUserId}`);
        return { success: true };
      }

      if (referral.creditApplied) {
        console.log(`[ReferralService] Credit already applied for referral ${referral.id}`);
        return { success: true };
      }

      const creditsEarned = await repos.referral.countCreditsEarned(referral.referrerId);
      if (creditsEarned >= MAX_REFERRAL_CREDITS) {
        console.log(`[ReferralService] Referrer ${referral.referrerId} has reached max credits (${MAX_REFERRAL_CREDITS})`);
        return { success: true };
      }

      const referrer = await repos.user.findById(referral.referrerId);
      if (!referrer?.stripeCustomerId) {
        console.error(`[ReferralService] Referrer ${referral.referrerId} has no Stripe customer ID`);
        return { success: false, error: 'Referrer has no Stripe customer' };
      }

      try {
        const credit = await stripeClient.customers.createBalanceTransaction(
          referrer.stripeCustomerId,
          {
            amount: -REFERRAL_CREDIT_AMOUNT_CENTS,
            currency: 'usd',
            description: 'Referral credit - 1 free month',
          }
        );

        await repos.referral.markCreditApplied(referral.id, REFERRAL_CREDIT_AMOUNT_CENTS);

        console.log(`[ReferralService] Applied $${(REFERRAL_CREDIT_AMOUNT_CENTS / 100).toFixed(2)} credit to referrer ${referrer.id}`);

        return { success: true, creditId: credit.id };
      } catch (error) {
        console.error('[ReferralService] Failed to apply credit:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async getRefereeCouponId(): Promise<string> {
      try {
        await stripeClient.coupons.retrieve(REFERRAL_COUPON_ID);
        return REFERRAL_COUPON_ID;
      } catch {
        await stripeClient.coupons.create({
          id: REFERRAL_COUPON_ID,
          amount_off: REFERRAL_CREDIT_AMOUNT_CENTS,
          currency: 'usd',
          duration: 'once',
          name: 'Referral - First Month Free',
        });
        console.log('[ReferralService] Created referral coupon in Stripe');
        return REFERRAL_COUPON_ID;
      }
    },

    async canEarnCredits(userId: string): Promise<boolean> {
      const creditsEarned = await repos.referral.countCreditsEarned(userId);
      return creditsEarned < MAX_REFERRAL_CREDITS;
    },
  };
}

