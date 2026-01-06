import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/fitness-plan
 *
 * Get user's current fitness plan
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

    // Fetch current fitness plan
    const services = getServices();
    const fitnessPlan = await services.fitnessPlan.getCurrentPlan(requestedUserId);

    if (!fitnessPlan) {
      return NextResponse.json(
        {
          success: false,
          message: 'No fitness plan found for this user',
        },
        { status: 404 }
      );
    }

    // Calculate current absoluteWeek based on plan start date
    const progress = await services.progress.getCurrentProgress(fitnessPlan);
    const absoluteWeek = progress?.absoluteWeek ?? 1;

    return NextResponse.json({
      success: true,
      data: {
        ...fitnessPlan,
        absoluteWeek,
      },
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
