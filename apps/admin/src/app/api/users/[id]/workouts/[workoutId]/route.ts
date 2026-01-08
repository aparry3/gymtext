import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';

/**
 * GET /api/users/[id]/workouts/[workoutId]
 *
 * Get a specific workout
 *
 * Authorization:
 * - Admin can access any user
 * - Regular user can only access their own data
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

    const { services } = await getAdminContext();
    const workout = await services.workoutInstance.getWorkoutById(
      workoutId,
      requestedUserId
    );

    if (!workout) {
      return NextResponse.json(
        { success: false, message: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workout,
    });
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
 * Authorization:
 * - Admin can delete any user's workouts
 * - Regular users cannot delete workouts (admin only)
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

    // Only admins can delete workouts
    if (!auth.isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: 'Only administrators can delete workouts',
        },
        { status: 403 }
      );
    }

    const { services } = await getAdminContext();
    const deleted = await services.workoutInstance.deleteWorkout(
      workoutId,
      requestedUserId
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Workout not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
