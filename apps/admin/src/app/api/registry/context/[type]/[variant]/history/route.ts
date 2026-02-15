import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

type RouteParams = { params: Promise<{ type: string; variant: string }> };

/**
 * GET /api/registry/context/[type]/[variant]/history
 * Returns version history for a context template.
 * Query param: limit (optional, default 20)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { type, variant } = await params;
  const limit = Number(request.nextUrl.searchParams.get('limit')) || 20;

  try {
    const { services } = await getAdminContext();
    const history = await services.contextTemplate.getHistory(type, variant, limit);

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching context template history:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}
