import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * GET /api/formatters/[id]
 *
 * Get a single formatter by formatter_id (latest active version).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formatterId } = await params;

    const { repos } = await getAdminContext();
    const [formatter] = await repos.formatter.getByIds([formatterId]);

    if (!formatter) {
      return NextResponse.json(
        { success: false, message: `Formatter '${formatterId}' not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        formatter_id: formatter.formatterId,
        content: formatter.content,
        description: formatter.description,
        version_id: formatter.versionId,
        created_at: formatter.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching formatter:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/formatters/[id]
 *
 * Update a formatter by appending a new version (never mutates historical rows).
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formatterId } = await params;
    const body = await request.json();
    const { content, description } = body;

    const { repos } = await getAdminContext();

    // Verify the formatter exists
    const [existing] = await repos.formatter.getByIds([formatterId]);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Formatter '${formatterId}' not found` },
        { status: 404 }
      );
    }

    // Append a new version
    const result = await repos.formatter.appendVersion(formatterId, {
      content: content !== undefined ? content : existing.content,
      description: description !== undefined ? description : existing.description,
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
    });
  } catch (error) {
    console.error('Error updating formatter:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/formatters/[id]
 *
 * Soft-delete a formatter by appending an inactive version.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: formatterId } = await params;

    const { repos } = await getAdminContext();

    const [existing] = await repos.formatter.getByIds([formatterId]);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: `Formatter '${formatterId}' not found` },
        { status: 404 }
      );
    }

    await repos.formatter.deactivate(formatterId);

    return NextResponse.json({
      success: true,
      data: { message: `Formatter '${formatterId}' has been deactivated` },
    });
  } catch (error) {
    console.error('Error deleting formatter:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
