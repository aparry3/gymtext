import Stripe from 'stripe';
import type { PromoCode } from '@/server/models/promoCode';
import type { RepositoryContainer } from '../../../repositories/factory';

export interface ValidatePromoResult {
  valid: boolean;
  stripeCouponId?: string;
  promoCodeId?: string;
  error?: string;
}

export interface StripeCouponDetails {
  id: string;
  name: string | null;
  amountOff: number | null;
  percentOff: number | null;
  currency: string | null;
  duration: string;
  durationInMonths: number | null;
  timesRedeemed: number;
  valid: boolean;
}

export interface CreatePromoCodeParams {
  code: string;
  name: string;
  discountType: 'amount_off' | 'percent_off';
  amount: number;
  duration: 'once' | 'repeating' | 'forever';
  durationInMonths?: number;
}

export interface PromoCodeServiceInstance {
  validatePromoCode(code: string): Promise<ValidatePromoResult>;
  createPromoCode(params: CreatePromoCodeParams): Promise<PromoCode>;
  deactivatePromoCode(id: string): Promise<PromoCode>;
  listAll(): Promise<PromoCode[]>;
  getStripeCouponDetails(stripeCouponId: string): Promise<StripeCouponDetails | null>;
}

export interface PromoCodeServiceDeps {
  stripeClient: Stripe;
}

export function createPromoCodeService(
  repos: RepositoryContainer,
  deps: PromoCodeServiceDeps
): PromoCodeServiceInstance {
  const { stripeClient } = deps;

  return {
    async validatePromoCode(code: string): Promise<ValidatePromoResult> {
      if (!code || code.length < 2 || code.length > 30) {
        return { valid: false, error: 'Invalid promo code format' };
      }

      const promoCode = await repos.promoCode.findByCode(code);
      if (!promoCode) {
        return { valid: false, error: 'Promo code not found' };
      }

      return {
        valid: true,
        stripeCouponId: promoCode.stripeCouponId,
        promoCodeId: promoCode.id,
      };
    },

    async createPromoCode(params: CreatePromoCodeParams): Promise<PromoCode> {
      // Create Stripe coupon
      const couponParams: Stripe.CouponCreateParams = {
        name: params.name,
        duration: params.duration,
        ...(params.duration === 'repeating' && params.durationInMonths && {
          duration_in_months: params.durationInMonths,
        }),
        ...(params.discountType === 'amount_off'
          ? { amount_off: Math.round(params.amount * 100), currency: 'usd' }
          : { percent_off: params.amount }),
      };

      const coupon = await stripeClient.coupons.create(couponParams);

      // Save mapping in DB
      return repos.promoCode.create({
        code: params.code,
        name: params.name,
        stripeCouponId: coupon.id,
      });
    },

    async deactivatePromoCode(id: string): Promise<PromoCode> {
      return repos.promoCode.deactivate(id);
    },

    async listAll(): Promise<PromoCode[]> {
      return repos.promoCode.findAll();
    },

    async getStripeCouponDetails(stripeCouponId: string): Promise<StripeCouponDetails | null> {
      try {
        const coupon = await stripeClient.coupons.retrieve(stripeCouponId);
        return {
          id: coupon.id,
          name: coupon.name,
          amountOff: coupon.amount_off,
          percentOff: coupon.percent_off,
          currency: coupon.currency,
          duration: coupon.duration,
          durationInMonths: coupon.duration_in_months,
          timesRedeemed: coupon.times_redeemed ?? 0,
          valid: coupon.valid,
        };
      } catch {
        return null;
      }
    },
  };
}
