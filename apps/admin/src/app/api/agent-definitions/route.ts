import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/agent-definitions
 * Returns all active agent definitions (latest version of each)
 */
export async function GET() {
  try {
    const { repos } = await getAdminContext();
    const definitions = await repos.agentDefinition.getAllActive();

    return NextResponse.json({
      success: true,
      data: definitions,
    });
  } catch (error) {
    console.error('Error fetching agent definitions:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agent definitions',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-definitions
 * Create or update an agent definition (upsert).
 * If an agent with the given agentId already exists, appends a new version.
 * If not, creates a new agent definition.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repos, services } = await getAdminContext();

    if (!body.agentId) {
      return NextResponse.json(
        { success: false, message: 'agentId is required' },
        { status: 400 }
      );
    }

    const existing = await repos.agentDefinition.getById(body.agentId);
    let result;
    if (existing) {
      result = await repos.agentDefinition.update(body.agentId, body);
    } else {
      result = await repos.agentDefinition.create(body);
    }

    services.agentDefinition.invalidateCache(body.agentId);

    return NextResponse.json(
      { success: true, data: result },
      { status: existing ? 200 : 201 }
    );
  } catch (error) {
    console.error('Error creating/updating agent definition:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
