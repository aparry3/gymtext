import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';

/**
 * GET /api/blog/popular
 * Get popular blog posts by view count
 */
export async function GET(request: NextRequest) {
  try {
    const services = getServices();
    const searchParams = request.nextUrl.searchParams;

    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)));

    const posts = await services.blog.listPopular(limit);

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('Error getting popular posts:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get popular posts' },
      { status: 500 }
    );
  }
}
