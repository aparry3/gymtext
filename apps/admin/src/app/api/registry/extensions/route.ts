import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/registry/extensions
 * Returns all agent extensions (agentId, extensionType, extensionKey).
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const extensions = await services.agentExtension.listAll();

    return NextResponse.json({
      success: true,
      data: extensions,
    });
  } catch (error) {
    console.error('Error fetching agent extensions:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
