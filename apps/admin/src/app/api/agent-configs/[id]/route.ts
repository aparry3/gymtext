import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { AgentConfigUpdate } from '@gymtext/shared/server';

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/agent-configs/[id]
 *
 * Get the latest config for a specific agent
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const { services } = await getAdminContext();
    const config = await services.agentConfig.getConfig(id);

    if (!config) {
      return NextResponse.json(
        { success: false, message: `Agent config '${id}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error fetching agent config:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agent config',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent-configs/[id]
 *
 * Save a new version of the agent config (creates new row in DB)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const update: AgentConfigUpdate = {
      systemPrompt: body.systemPrompt,
      userPrompt: body.userPrompt,
      model: body.model,
      temperature: body.temperature,
      maxTokens: body.maxTokens,
      maxIterations: body.maxIterations,
    };

    // Validate that systemPrompt is provided for new configs
    // (saveConfig will merge with existing if available)
    const { services } = await getAdminContext();
    const existing = await services.agentConfig.getConfig(id);

    if (!existing && !update.systemPrompt) {
      return NextResponse.json(
        { success: false, message: 'System prompt is required for new agent configs' },
        { status: 400 }
      );
    }

    const saved = await services.agentConfig.saveConfig(id, update);

    return NextResponse.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error saving agent config:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred saving agent config',
      },
      { status: 500 }
    );
  }
}
