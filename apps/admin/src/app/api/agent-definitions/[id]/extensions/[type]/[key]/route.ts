import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ id: string; type: string; key: string }> };

/**
 * GET /api/agent-definitions/{id}/extensions/{type}/{key}
 * Returns the latest extension for a given agent, type, and key
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id, type, key } = await params;

  try {
    const { services } = await getAdminContext();
    const extension = await services.agentExtension.getExtension(id, type, key);

    return NextResponse.json({
      success: true,
      data: extension,
    });
  } catch (error) {
    console.error('Error fetching agent extension:', error);
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
 * POST /api/agent-definitions/{id}/extensions/{type}/{key}
 * Creates a new version of an agent extension
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id, type, key } = await params;

  try {
    const body = await request.json();

    const { services } = await getAdminContext();
    const saved = await services.agentExtension.saveExtension(id, type, key, body);

    // Invalidate cache for this extension
    services.agentExtension.invalidateCache(id, type, key);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error saving agent extension:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
