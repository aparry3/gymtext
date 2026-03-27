import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * PATCH /api/promotions/:id
 *
 * Deactivates a Stripe promotion code.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const promoCode = await services.promoCode.deactivatePromoCode(id);

    return NextResponse.json({
      success: true,
      data: {
        id: promoCode.id,
        code: promoCode.code,
        isActive: promoCode.active,
      },
    });
  } catch (error) {
    console.error('Error deactivating promotion code:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to deactivate promotion code' },
      { status: 500 }
    );
  }
}
