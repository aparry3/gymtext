import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/blog/[id]
 *
 * Get a single blog post by ID (for the authenticated owner)
 */
export async function GET(request: Request, { params }: RouteParams) {
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

    const post = await services.blog.getById(id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (post.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
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
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const ownerId = ownerCookie.value;
    const body = await request.json();

    const { title, slug, description, content, tags, metaTitle, metaDescription, coverImageId } = body;

    const { services } = await getProgramsContext();

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
