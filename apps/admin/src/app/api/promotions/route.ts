import { NextResponse } from 'next/server';
import { getAdminContext, getEnvironmentMode } from '@/lib/context';
import { getStripeClient } from '@/lib/stripe';

/**
 * GET /api/promotions
 *
 * Lists promo codes from DB with Stripe coupon details.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const mode = await getEnvironmentMode();
    const stripe = getStripeClient(mode);

    const promoCodes = await services.promoCode.listAll();

    // Fetch Stripe coupon details for each promo code
    const codes = await Promise.all(
      promoCodes.map(async (pc) => {
        let coupon = null;
        try {
          const c = await stripe.coupons.retrieve(pc.stripeCouponId);
          coupon = {
            name: c.name,
            amountOff: c.amount_off,
            percentOff: c.percent_off,
            currency: c.currency,
            duration: c.duration,
            durationInMonths: c.duration_in_months,
            timesRedeemed: c.times_redeemed ?? 0,
            valid: c.valid,
          };
        } catch {
          // Coupon may have been deleted from Stripe
        }
        return { ...pc, coupon };
      })
    );

    const stats = {
      total: codes.length,
      active: codes.filter((c) => c.isActive).length,
      totalRedemptions: codes.reduce((sum, c) => sum + (c.coupon?.timesRedeemed ?? 0), 0),
    };

    return NextResponse.json({ success: true, data: { codes, stats } });
  } catch (error) {
    console.error('Error fetching promotion codes:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch promotion codes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/promotions
 *
 * Creates a Stripe coupon + DB promo code record.
 * Body: { code, name, discountType, amount, duration, durationInMonths? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, discountType, amount, duration, durationInMonths } = body;

    if (!code || !name || !discountType || !amount || !duration) {
      return NextResponse.json(
        { success: false, message: 'code, name, discountType, amount, and duration are required' },
        { status: 400 }
      );
    }

    if (!['amount_off', 'percent_off'].includes(discountType)) {
      return NextResponse.json(
        { success: false, message: 'discountType must be "amount_off" or "percent_off"' },
        { status: 400 }
      );
    }

    if (!['once', 'repeating', 'forever'].includes(duration)) {
      return NextResponse.json(
        { success: false, message: 'duration must be "once", "repeating", or "forever"' },
        { status: 400 }
      );
    }

    if (duration === 'repeating' && !durationInMonths) {
      return NextResponse.json(
        { success: false, message: 'durationInMonths is required when duration is "repeating"' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    const promoCode = await services.promoCode.createPromoCode({
      code,
      name,
      discountType,
      amount: Number(amount),
      duration,
      ...(durationInMonths && { durationInMonths: Number(durationInMonths) }),
    });

    return NextResponse.json({
      success: true,
      data: promoCode,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion code:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create promotion code' },
      { status: 500 }
    );
  }
}
