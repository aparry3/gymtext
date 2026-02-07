import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/agent-definitions/{id}/history
 * Returns the version history for an agent definition
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    const { repos } = await getAdminContext();
    const history = await repos.agentDefinition.getHistory(id, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching agent definition history:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-definitions/{id}/history
 * Reverts to a specific version (creates new version with old content)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { versionId } = body;

    if (typeof versionId !== 'number') {
      return NextResponse.json(
        { success: false, message: 'versionId is required' },
        { status: 400 }
      );
    }

    const { repos, services } = await getAdminContext();
    const reverted = await repos.agentDefinition.revert(id, versionId);

    // Invalidate cache
    services.agentDefinition.invalidateCache(id);

    return NextResponse.json({
      success: true,
      data: reverted,
    });
  } catch (error) {
    console.error('Error reverting agent definition:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
