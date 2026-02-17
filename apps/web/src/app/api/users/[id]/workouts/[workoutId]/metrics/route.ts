import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { checkAuthorization } from '@/server/utils/authMiddleware';
import type { ExerciseMetricData } from '@gymtext/shared/server';

/**
 * GET /api/users/[id]/workouts/[workoutId]/metrics
 *
 * Get all exercise metrics for a workout
 *
 * Returns: { [exerciseId]: ExerciseMetricData }
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
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const services = getServices();
    const metrics = await services.exerciseMetrics.getWorkoutMetrics(workoutId);

    return NextResponse.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error('Error fetching workout metrics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[id]/workouts/[workoutId]/metrics
 *
 * Save exercise metrics for a workout
 *
 * Body: { exerciseId: string, data: ExerciseMetricData }
 */
export async function POST(
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
        { success: false, message: auth.error || 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { exerciseId, data } = body as { exerciseId?: string; data?: ExerciseMetricData };

    if (!exerciseId) {
      return NextResponse.json(
        { success: false, message: 'Exercise ID is required' },
        { status: 400 }
      );
    }

    if (!data || !data.type) {
      return NextResponse.json(
        { success: false, message: 'Metric data is required with a valid type' },
        { status: 400 }
      );
    }

    const services = getServices();

    const metric = await services.exerciseMetrics.saveExerciseProgress(
      requestedUserId,
      workoutId,
      exerciseId,
      data
    );

    return NextResponse.json({
      success: true,
      data: metric,
    });
  } catch (error) {
    console.error('Error saving workout metrics:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
