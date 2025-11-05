import { NextRequest, NextResponse } from 'next/server';
import { workoutInstanceService } from '@/server/services';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/workouts
 *
 * Get user's workouts
 *
 * Query params:
 * - limit: number (default 10)
 * - startDate: ISO date string (optional, for date range filter)
 * - endDate: ISO date string (optional, for date range filter)
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

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

    // If filtering by date range (for microcycle week view)
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const workouts = await workoutInstanceService.getWorkoutsByDateRange(
          requestedUserId,
          startDate,
          endDate
        );
        return NextResponse.json({
          success: true,
          data: workouts,
        });
      }
    }

    // Otherwise, get recent workouts
    const workouts = await workoutInstanceService.getRecentWorkouts(
      requestedUserId,
      limit
    );

    return NextResponse.json({
      success: true,
      data: workouts,
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
