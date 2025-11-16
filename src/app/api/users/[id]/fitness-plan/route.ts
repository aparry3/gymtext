import { NextRequest, NextResponse } from 'next/server';
import { fitnessPlanService } from '@/server/services';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/fitness-plan
 *
 * Get user's fitness plan
 *
 * Authorization:
 * - Admin can access any user
 * - Regular user can only access their own data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    if (!requestedUserId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check authorization
    const auth = checkAuthorization(request, requestedUserId);

    if (!auth.isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || 'Unauthorized',
        },
        { status: 403 }
      );
    }

    // Fetch fitness plan with mesocycle records
    const fitnessPlan = await fitnessPlanService.getCurrentPlanWithMesocycles(requestedUserId);

    if (!fitnessPlan) {
      return NextResponse.json(
        {
          success: false,
          message: 'No fitness plan found for this user',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: fitnessPlan,
    });
  } catch (error) {
    console.error('Error fetching fitness plan:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
