import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/registry/tools
 * Returns detailed metadata for all registered tools.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const tools = services.toolRegistry.listDetailed();

    return NextResponse.json({
      success: true,
      data: tools,
    });
  } catch (error) {
    console.error('Error fetching tool registry:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
