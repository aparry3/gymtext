import Stripe from 'stripe';

export interface ValidatePromoResult {
  valid: boolean;
  stripeCouponId?: string;
  stripePromotionCodeId?: string;
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

export interface StripePromoCode {
  id: string;
  code: string;
  active: boolean;
  coupon: StripeCouponDetails;
  created: number;
  timesRedeemed: number;
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
  createPromoCode(params: CreatePromoCodeParams): Promise<StripePromoCode>;
  deactivatePromoCode(id: string): Promise<StripePromoCode>;
  listAll(): Promise<StripePromoCode[]>;
  getStripeCouponDetails(stripeCouponId: string): Promise<StripeCouponDetails | null>;
}

export interface PromoCodeServiceDeps {
  stripeClient: Stripe;
}

function mapCoupon(coupon: Stripe.Coupon): StripeCouponDetails {
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
}

function mapPromoCode(pc: Stripe.PromotionCode): StripePromoCode {
  const coupon = typeof pc.coupon === 'string'
    ? null
    : mapCoupon(pc.coupon);

  return {
    id: pc.id,
    code: pc.code,
    active: pc.active,
    coupon: coupon!,
    created: pc.created,
    timesRedeemed: pc.times_redeemed,
  };
}

export function createPromoCodeService(
  deps: PromoCodeServiceDeps
): PromoCodeServiceInstance {
  const { stripeClient } = deps;

  return {
    async validatePromoCode(code: string): Promise<ValidatePromoResult> {
      if (!code || code.length < 2 || code.length > 30) {
        return { valid: false, error: 'Invalid promo code format' };
      }

      try {
        const result = await stripeClient.promotionCodes.list({
          code: code.toUpperCase(),
          active: true,
          limit: 1,
        });

        const promoCode = result.data[0];
        if (!promoCode) {
          return { valid: false, error: 'Promo code not found' };
        }

        const couponId = typeof promoCode.coupon === 'string'
          ? promoCode.coupon
          : promoCode.coupon.id;

        return {
          valid: true,
          stripeCouponId: couponId,
          stripePromotionCodeId: promoCode.id,
        };
      } catch {
        return { valid: false, error: 'Failed to validate promo code' };
      }
    },

    async createPromoCode(params: CreatePromoCodeParams): Promise<StripePromoCode> {
      // Create Stripe coupon (discount definition)
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

      // Create Stripe promotion code (customer-facing code)
      const promoCode = await stripeClient.promotionCodes.create({
        coupon: coupon.id,
        code: params.code.toUpperCase(),
      });

      return mapPromoCode(promoCode);
    },

    async deactivatePromoCode(id: string): Promise<StripePromoCode> {
      const promoCode = await stripeClient.promotionCodes.update(id, {
        active: false,
      });

      return mapPromoCode(promoCode);
    },

    async listAll(): Promise<StripePromoCode[]> {
      const result = await stripeClient.promotionCodes.list({
        limit: 100,
        expand: ['data.coupon'],
      });

      return result.data.map(mapPromoCode);
    },

    async getStripeCouponDetails(stripeCouponId: string): Promise<StripeCouponDetails | null> {
      try {
        const coupon = await stripeClient.coupons.retrieve(stripeCouponId);
        return mapCoupon(coupon);
      } catch {
        return null;
      }
    },
  };
}
