import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/tools
 *
 * List all registered tools with metadata.
 */
export async function GET() {
  try {
    const { services } = await getAdminContext();
    const tools = services.toolRegistry.list();

    return NextResponse.json({
      success: true,
      data: { tools },
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred fetching tools' },
      { status: 500 }
    );
  }
}
