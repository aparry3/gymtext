import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const versions = await services.programVersion.getByProgramId(id);

    return NextResponse.json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { services } = await getAdminContext();

    const program = await services.program.getById(id);
    if (!program) {
      return NextResponse.json(
        { success: false, message: 'Program not found' },
        { status: 404 }
      );
    }

    const version = await services.programVersion.createDraft(id, {
      content: body.content || null,
      generationConfig: body.generationConfig || null,
      defaultDurationWeeks: body.defaultDurationWeeks || null,
      difficultyMetadata: body.difficultyMetadata || null,
      questions: body.questions || null,
    });

    return NextResponse.json({
      success: true,
      data: version,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to create version' },
      { status: 500 }
    );
  }
}
