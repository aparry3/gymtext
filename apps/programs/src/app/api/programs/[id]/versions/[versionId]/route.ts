import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

type RouteContext = {
  params: Promise<{ id: string; versionId: string }>;
};

/**
 * PATCH /api/programs/[id]/versions/[versionId]
 *
 * Update a program version
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const cookieStore = await cookies();
    const ownerCookie = cookieStore.get('gt_programs_owner');

    if (!ownerCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: programId, versionId } = await context.params;
    const ownerId = ownerCookie.value;
    const body = await request.json();
    const { services } = await getProgramsContext();

    // Verify program ownership
    const program = await services.program.getById(programId);

    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    if (program.ownerId !== ownerId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get the version to verify it exists
    const existingVersion = await services.programVersion.getById(versionId);

    if (!existingVersion || existingVersion.programId !== programId) {
      return NextResponse.json(
        { success: false, message: 'Version not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const updateData: Record<string, unknown> = {};

    if (body.templateMarkdown !== undefined) updateData.templateMarkdown = body.templateMarkdown || null;
    if (body.templateStructured !== undefined) updateData.templateStructured = body.templateStructured || null;
    if (body.generationConfig !== undefined) updateData.generationConfig = body.generationConfig || null;
    if (body.defaultDurationWeeks !== undefined) updateData.defaultDurationWeeks = body.defaultDurationWeeks || null;
    if (body.difficultyMetadata !== undefined) updateData.difficultyMetadata = body.difficultyMetadata || null;
    if (body.questions !== undefined) updateData.questions = body.questions || null;
    if (body.status !== undefined) updateData.status = body.status;

    // Handle publishing
    if (body.status === 'published' && existingVersion.status !== 'published') {
      updateData.publishedAt = new Date();
      // Update program's published version
      await services.program.update(programId, { publishedVersionId: versionId });
    }

    const version = await services.programVersion.update(versionId, updateData);

    return NextResponse.json({
      success: true,
      data: version,
    });
  } catch (error) {
    console.error('[Programs API] Error updating version:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
