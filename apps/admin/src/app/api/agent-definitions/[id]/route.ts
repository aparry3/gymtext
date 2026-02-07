import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/agent-definitions/{id}
 * Returns the latest version of an agent definition
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { repos } = await getAdminContext();
    const definition = await repos.agentDefinition.getById(id);

    if (!definition) {
      return NextResponse.json(
        { success: false, message: 'Agent definition not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: definition,
    });
  } catch (error) {
    console.error('Error fetching agent definition:', error);

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
 * PATCH /api/agent-definitions/{id}
 * Updates an agent definition (creates new version via append-only pattern)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { repos, services } = await getAdminContext();

    // Validate the agent exists
    const existing = await repos.agentDefinition.getById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Agent definition not found' },
        { status: 404 }
      );
    }

    // Update (creates new version)
    const updated = await repos.agentDefinition.update(id, {
      systemPrompt: body.systemPrompt,
      userPrompt: body.userPrompt,
      model: body.model,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      maxIterations: body.maxIterations,
      maxRetries: body.maxRetries,
      description: body.description,
      isActive: body.isActive,
    });

    // Invalidate cache
    services.agentDefinition.invalidateCache(id);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating agent definition:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
