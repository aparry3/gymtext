import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/promotions
 *
 * Lists promotion codes from Stripe.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();

    const promoCodes = await services.promoCode.listAll();

    const codes = promoCodes.map((pc) => ({
      id: pc.id,
      code: pc.code,
      name: pc.coupon?.name || pc.code,
      isActive: pc.active,
      createdAt: pc.created,
      coupon: pc.coupon,
    }));

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
 * Creates a Stripe coupon and promotion code.
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
      data: {
        id: promoCode.id,
        code: promoCode.code,
        name: promoCode.coupon?.name || promoCode.code,
        isActive: promoCode.active,
        createdAt: promoCode.created,
        coupon: promoCode.coupon,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating promotion code:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create promotion code' },
      { status: 500 }
    );
  }
}
