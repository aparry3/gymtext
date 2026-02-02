import { NextResponse } from 'next/server';
import { getServices } from '@/lib/context';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/blog/[slug]
 * Get a single published blog post by slug
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const services = getServices();

    const post = await services.blog.getPublishedBySlug(slug);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Track view
    services.blog.trackView(post.id).catch(() => {});

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error getting blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get blog post' },
      { status: 500 }
    );
  }
}
