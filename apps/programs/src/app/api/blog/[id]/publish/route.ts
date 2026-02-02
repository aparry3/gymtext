import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/blog/[id]/publish
 *
 * Publish a blog post
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const { services } = await getProgramsContext();

    const post = await services.blog.publish(id, ownerId);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('[Blog API] Error publishing post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/[id]/publish
 *
 * Unpublish a blog post (set to draft)
 */
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const { services } = await getProgramsContext();

    const post = await services.blog.unpublish(id, ownerId);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('[Blog API] Error unpublishing post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
