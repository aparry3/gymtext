import { NextRequest, NextResponse } from 'next/server';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/workouts
 *
 * Get user's workouts
 *
 * Note: WorkoutInstance storage has been removed. Workouts are now generated on-demand.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    if (!requestedUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
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

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
