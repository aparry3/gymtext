import { NextRequest, NextResponse } from 'next/server';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

/**
 * GET /api/users/[id]/mesocycles
 * Get all mesocycles for a user's fitness plan
 *
 * Query params:
 * - fitnessPlanId: (optional) filter by fitness plan ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params;
    const { searchParams } = new URL(request.url);
    const fitnessPlanId = searchParams.get('fitnessPlanId');

    const mesocycleRepo = new MesocycleRepository(postgresDb);

    let mesocycles;
    if (fitnessPlanId) {
      mesocycles = await mesocycleRepo.getMesocyclesByPlanId(fitnessPlanId);
    } else {
      mesocycles = await mesocycleRepo.getMesocyclesByUserId(userId);
    }

    return NextResponse.json({
      success: true,
      data: mesocycles,
    });
  } catch (error) {
    console.error('[API] Error fetching mesocycles:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch mesocycles',
      },
      { status: 500 }
    );
  }
}
