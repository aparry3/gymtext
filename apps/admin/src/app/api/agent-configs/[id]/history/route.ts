import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/agent-configs/[id]/history
 *
 * Get version history for an agent config
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    // Get optional limit from query params (default 10)
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const { services } = await getAdminContext();
    const history = await services.agentConfig.getHistory(id, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching agent config history:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agent config history',
      },
      { status: 500 }
    );
  }
}
