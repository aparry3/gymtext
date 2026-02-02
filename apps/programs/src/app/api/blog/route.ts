import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

/**
 * GET /api/blog
 *
 * List all blog posts for the authenticated program owner
 */
export async function GET() {
  try {
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

    const posts = await services.blog.getByOwnerId(ownerId);

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error) {
    console.error('[Blog API] Error listing posts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/blog
 *
 * Create a new blog post for the authenticated program owner
 */
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    const { services } = await getProgramsContext();

    const post = await services.blog.create(ownerId, {
      title: title.trim(),
      slug: slug?.trim() || undefined,
      description: description?.trim() || undefined,
      content,
      tags: Array.isArray(tags) ? tags : undefined,
      metaTitle: metaTitle?.trim() || undefined,
      metaDescription: metaDescription?.trim() || undefined,
      coverImageId: coverImageId || undefined,
    });

    return NextResponse.json(
      { success: true, data: post },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Blog API] Error creating post:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
