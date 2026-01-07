import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * DELETE /api/admin/chains/fitness-plans/[planId]
 *
 * Delete a fitness plan by ID
 * Admin only (protected by middleware)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId } = await params;

    if (!planId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Plan ID is required',
        },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const deleted = await services.fitnessPlan.deleteFitnessPlan(planId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Fitness plan not found or already deleted',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fitness plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting fitness plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
