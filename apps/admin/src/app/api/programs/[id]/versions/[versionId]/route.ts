import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string; versionId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id, versionId } = await params;
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const version = await services.programVersion.getById(versionId);
    if (!version || version.programId !== id) {
      return NextResponse.json(
        { success: false, message: 'Version not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { version, program },
    });
  } catch (error) {
    console.error('Error fetching version:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch version' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id, versionId } = await params;
    const body = await request.json();
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const existingVersion = await services.programVersion.getById(versionId);
    if (!existingVersion || existingVersion.programId !== id) {
      return NextResponse.json(
        { success: false, message: 'Version not found' },
        { status: 404 }
      );
    }

    // Handle lifecycle actions
    if (body.action === 'publish') {
      const version = await services.programVersion.publish(versionId);
      return NextResponse.json({ success: true, data: version });
    }

    if (body.action === 'archive') {
      const version = await services.programVersion.archive(versionId);
      return NextResponse.json({ success: true, data: version });
    }

    // Handle field updates (only for draft versions)
    if (existingVersion.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Only draft versions can be edited' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.content !== undefined) updateData.content = body.content || null;
    if (body.generationConfig !== undefined) updateData.generationConfig = body.generationConfig || null;
    if (body.defaultDurationWeeks !== undefined) updateData.defaultDurationWeeks = body.defaultDurationWeeks || null;
    if (body.difficultyMetadata !== undefined) updateData.difficultyMetadata = body.difficultyMetadata || null;
    if (body.questions !== undefined) updateData.questions = body.questions || null;

    const version = await services.programVersion.update(versionId, updateData);

    return NextResponse.json({ success: true, data: version });
  } catch (error) {
    console.error('Error updating version:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to update version' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id, versionId } = await params;
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const version = await services.programVersion.getById(versionId);
    if (!version || version.programId !== id) {
      return NextResponse.json(
        { success: false, message: 'Version not found' },
        { status: 404 }
      );
    }

    if (version.status !== 'draft') {
      return NextResponse.json(
        { success: false, message: 'Only draft versions can be deleted' },
        { status: 400 }
      );
    }

    await services.programVersion.deleteDraft(versionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting version:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to delete version' },
      { status: 500 }
    );
  }
}
