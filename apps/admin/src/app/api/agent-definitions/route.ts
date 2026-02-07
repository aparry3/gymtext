import { NextResponse } from 'next/server';
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
