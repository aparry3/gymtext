import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/formatters
 *
 * List all formatters (latest active version of each).
 */
export async function GET() {
  try {
    const { repos } = await getAdminContext();
    const formatters = await repos.formatter.getAll();

    return NextResponse.json({
      success: true,
      data: {
        formatters: formatters.map((f) => ({
          formatter_id: f.formatterId,
          content: f.content,
          description: f.description,
          version_id: f.versionId,
          created_at: f.createdAt,
        })),
        count: formatters.length,
      },
    });
  } catch (error) {
    console.error('Error fetching formatters:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred fetching formatters' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/formatters
 *
 * Create a new formatter.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formatter_id, content, description = null } = body;

    if (!formatter_id || !content) {
      return NextResponse.json(
        { success: false, message: 'formatter_id and content are required' },
        { status: 400 }
      );
    }

    const { repos } = await getAdminContext();

    // Check if formatter already exists
    const existing = await repos.formatter.getByIds([formatter_id]);
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: `Formatter '${formatter_id}' already exists` },
        { status: 409 }
      );
    }

    const result = await repos.formatter.create({
      formatterId: formatter_id,
      content,
      description,
    });

    return NextResponse.json({
      success: true,
      data: {
        formatter_id: result.formatterId,
        content: result.content,
        description: result.description,
        version_id: result.versionId,
        created_at: result.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating formatter:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred creating formatter' },
      { status: 500 }
    );
  }
}
