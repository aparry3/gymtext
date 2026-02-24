import { NextRequest, NextResponse } from 'next/server';
import { checkAuthorization } from '@/server/utils/authMiddleware';
import { getServices } from '@/lib/context';

/**
 * GET /api/users/[id]/workouts/[workoutId]
 *
 * Get a specific workout instance.
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

    const services = getServices();
    const workout = await services.workoutInstance.getById(workoutId);

    if (!workout || workout.clientId !== requestedUserId) {
      return NextResponse.json(
        { success: false, message: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: workout.id,
        date: workout.date,
        message: workout.message,
        details: workout.details,
      },
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
 * Delete a specific workout (not yet implemented).
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
      { success: false, message: 'Delete not implemented' },
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
