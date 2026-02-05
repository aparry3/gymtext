import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/agent-configs
 *
 * List all agent config IDs with their latest configs
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const configs = await services.agentConfig.getAllLatest();

    return NextResponse.json({
      success: true,
      data: configs,
    });
  } catch (error) {
    console.error('Error fetching agent configs:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred fetching agent configs',
      },
      { status: 500 }
    );
  }
}
