import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * DELETE /api/admin/chains/workouts/[workoutId]
 *
 * Delete a workout by ID
 * Admin only (protected by middleware)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;

    if (!workoutId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Workout ID is required',
        },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Get the workout first to find its userId
    const workout = await services.workoutInstance.getWorkoutByIdInternal(workoutId);

    if (!workout) {
      return NextResponse.json(
        {
          success: false,
          message: 'Workout not found',
        },
        { status: 404 }
      );
    }

    const deleted = await services.workoutInstance.deleteWorkout(workoutId, workout.clientId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to delete workout',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
