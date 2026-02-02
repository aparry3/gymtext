import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';

/**
 * GET /api/blog
 * List published blog posts with optional filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const services = getServices();
    const searchParams = request.nextUrl.searchParams;

    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10));
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await services.blog.listPublished({
      limit,
      offset,
      tag,
      search,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error listing blog posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to list blog posts' },
      { status: 500 }
    );
  }
}
