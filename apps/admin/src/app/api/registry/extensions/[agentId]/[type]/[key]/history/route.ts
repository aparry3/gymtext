import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ agentId: string; type: string; key: string }> };

/**
 * GET /api/registry/extensions/[agentId]/[type]/[key]/history
 * Returns version history for an agent extension.
 * Query param: limit (optional, default 20)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { agentId, type, key } = await params;
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 20;

  try {
    const { services } = await getAdminContext();
    const history = await services.agentExtension.getHistory(agentId, type, key, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching agent extension history:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
