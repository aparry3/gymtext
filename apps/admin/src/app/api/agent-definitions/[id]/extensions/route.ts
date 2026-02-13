import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/agent-definitions/{id}/extensions
 * Returns all extensions for an agent (latest versions of each type/key pair)
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { services } = await getAdminContext();
    const extensions = await services.agentExtension.getFullExtensionsByAgent(id);

    return NextResponse.json({
      success: true,
      data: extensions,
    });
  } catch (error) {
    console.error('Error fetching extensions:', error);
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
 * POST /api/agent-definitions/{id}/extensions
 * Creates a new extension for an agent
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { extensionType, extensionKey, ...fields } = body;

    if (!extensionType || !extensionKey) {
      return NextResponse.json(
        { success: false, message: 'extensionType and extensionKey are required' },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();
    const saved = await services.agentExtension.saveExtension(id, extensionType, extensionKey, fields);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error creating extension:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
