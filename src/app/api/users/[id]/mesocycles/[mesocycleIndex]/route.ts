import { NextRequest, NextResponse } from 'next/server';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

/**
 * GET /api/users/[id]/mesocycles/[mesocycleIndex]
 * Get a specific mesocycle by index for a user's current fitness plan
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mesocycleIndex: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId, mesocycleIndex } = await params;
    const index = parseInt(mesocycleIndex, 10);

    if (isNaN(index)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid mesocycle index',
        },
        { status: 400 }
      );
    }

    // Get user's current fitness plan
    const fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    const fitnessPlan = await fitnessPlanRepo.getCurrentPlan(userId);

    if (!fitnessPlan) {
      return NextResponse.json(
        {
          success: false,
          message: 'No fitness plan found for user',
        },
        { status: 404 }
      );
    }

    // Get mesocycle by index
    const mesocycleRepo = new MesocycleRepository(postgresDb);
    const mesocycle = await mesocycleRepo.getMesocycleByIndex(
      fitnessPlan.id!,
      index
    );

    if (!mesocycle) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mesocycle not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mesocycle,
    });
  } catch (error) {
    console.error('[API] Error fetching mesocycle:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch mesocycle',
      },
      { status: 500 }
    );
  }
}
