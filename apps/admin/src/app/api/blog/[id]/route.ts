import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { getAdminOwnerId } from '@/lib/adminIdentity';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/blog/[id]
 *
 * Get a single blog post by ID
 */
export async function GET(request: Request, { params }: RouteParams) {
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
    const post = await services.blog.getById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('[Blog API] Error getting post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/blog/[id]
 *
 * Update a blog post
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const ownerId = await getAdminOwnerId();

    if (!ownerId) {
      return NextResponse.json(
        { success: false, message: 'No program owner linked to this admin account' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, slug, description, content, tags, metaTitle, metaDescription, coverImageId } = body;

    const { services } = await getAdminContext();

    const post = await services.blog.update(id, ownerId, {
      title: title?.trim(),
      slug: slug?.trim(),
      description: description === null ? null : description?.trim(),
      content,
      tags: Array.isArray(tags) ? tags : undefined,
      metaTitle: metaTitle === null ? null : metaTitle?.trim(),
      metaDescription: metaDescription === null ? null : metaDescription?.trim(),
      coverImageId: coverImageId === null ? null : coverImageId,
    });

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
    console.error('[Blog API] Error updating post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blog/[id]
 *
 * Delete a blog post
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
    const deleted = await services.blog.delete(id, ownerId);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Post not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    console.error('[Blog API] Error deleting post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
