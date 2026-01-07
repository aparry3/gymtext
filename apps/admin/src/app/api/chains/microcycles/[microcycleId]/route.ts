import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * DELETE /api/admin/chains/microcycles/[microcycleId]
 *
 * Delete a microcycle by ID and cascade delete all associated workouts
 * Admin only (protected by middleware)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ microcycleId: string }> }
) {
  try {
    const { microcycleId } = await params;

    if (!microcycleId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Microcycle ID is required',
        },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const { deleted, deletedWorkoutsCount } = await services.microcycle.deleteMicrocycleWithWorkouts(microcycleId);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          message: 'Microcycle not found or already deleted',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Microcycle deleted successfully (${deletedWorkoutsCount} workouts also deleted)`,
    });
  } catch (error) {
    console.error('Error deleting microcycle:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
