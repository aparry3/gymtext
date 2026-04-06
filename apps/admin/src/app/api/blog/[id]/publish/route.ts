import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { getAdminOwnerId } from '@/lib/adminIdentity';

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
    const ownerId = await getAdminOwnerId();

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: 'No program owner linked to this admin account' },
        { status: 403 }
      );
    }

    const { services } = await getAdminContext();
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
    const ownerId = await getAdminOwnerId();

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: 'No program owner linked to this admin account' },
        { status: 403 }
      );
    }

    const { services } = await getAdminContext();
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
