import { NextRequest, NextResponse } from 'next/server';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/workouts/[workoutId]
 *
 * Get a specific workout
 *
 * Note: WorkoutInstance storage has been removed. Workouts are now generated on-demand.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id: requestedUserId, workoutId } = await params;

    if (!requestedUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!workoutId) {
      return NextResponse.json(
        { success: false, message: 'Workout ID is required' },
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

    return NextResponse.json(
      { success: false, message: 'Workout instances are no longer stored' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]/workouts/[workoutId]
 *
 * Delete a specific workout
 *
 * Note: WorkoutInstance storage has been removed.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; workoutId: string }> }
) {
  try {
    const { id: requestedUserId, workoutId } = await params;

    if (!requestedUserId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!workoutId) {
      return NextResponse.json(
        { success: false, message: 'Workout ID is required' },
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

    return NextResponse.json(
      { success: false, message: 'Workout instances are no longer stored' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
