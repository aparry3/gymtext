import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createBlogMetadataAgentService } from '@gymtext/shared/server/services';

/**
 * POST /api/blog/generate-metadata
 *
 * Generate metadata (title, description, tags, SEO fields) for blog content using AI.
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

    const body = await request.json();
    const { content } = body;

    // Validate content exists and has minimum length
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Strip HTML for length check
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

    if (textContent.length < 100) {
      return NextResponse.json(
        { success: false, message: 'Content must be at least 100 characters for metadata generation' },
        { status: 400 }
      );
    }

    // Generate metadata using the agent service
    const agentService = createBlogMetadataAgentService();
    const metadata = await agentService.generateMetadata(content);

    return NextResponse.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    console.error('[Blog Generate Metadata API] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate metadata' },
      { status: 500 }
    );
  }
}
