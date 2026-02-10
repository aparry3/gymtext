import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { AGENT_DOMAINS } from '@/components/admin/agents/types';

/**
 * GET /api/agent-registries
 * Returns metadata about available tools, context types, and agent IDs
 * for populating the agent definition editor dropdowns.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();

    const tools = services.toolRegistry.list();

    const contextTypes = [
      'user',
      'userProfile',
      'fitnessPlan',
      'dayOverview',
      'currentWorkout',
      'dateContext',
      'trainingMeta',
      'currentMicrocycle',
      'experienceLevel',
      'dayFormat',
      'programVersion',
      'availableExercises',
    ];

    const agentIds = AGENT_DOMAINS.flatMap((domain) =>
      domain.agents.map((agent) => agent.id)
    );

    return NextResponse.json({
      success: true,
      data: { tools, contextTypes, agentIds },
    });
  } catch (error) {
    console.error('Error fetching agent registries:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
