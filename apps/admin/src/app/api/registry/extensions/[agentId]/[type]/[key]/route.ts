import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ agentId: string; type: string; key: string }> };

/**
 * GET /api/registry/extensions/[agentId]/[type]/[key]
 * Returns the latest agent extension for a given agent, type, and key.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { agentId, type, key } = await params;

  try {
    const { services } = await getAdminContext();
    const extension = await services.agentExtension.getExtension(agentId, type, key);

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
 * POST /api/registry/extensions/[agentId]/[type]/[key]
 * Creates a new version of an agent extension.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { agentId, type, key } = await params;

  try {
    const body = await request.json();
    const { content, evalRubric } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const saved = await services.agentExtension.saveExtension(
      agentId,
      type,
      key,
      content,
      evalRubric ?? undefined
    );

    // Invalidate cache for this extension
    services.agentExtension.invalidateCache(agentId, type, key);

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
