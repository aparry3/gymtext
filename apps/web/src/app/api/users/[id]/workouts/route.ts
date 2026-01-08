import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/workouts
 *
 * Get user's workouts
 *
 * Query params:
 * - limit: number (default 10) - returns N most recent workouts by date DESC
 * - startDate: ISO date string (optional, for date range filter)
 * - endDate: ISO date string (optional, for date range filter)
 *
 * Default behavior: Returns recent workouts ordered by date descending.
 * Frontend determines "today" / "tomorrow" using browser timezone.
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

    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    // If filtering by date range
    const services = getServices();
    if (startDateParam && endDateParam) {
      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const workouts = await services.workoutInstance.getWorkoutsByDateRange(
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

    // Default: return recent workouts by date DESC
    const workouts = await services.workoutInstance.getRecentWorkouts(
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
