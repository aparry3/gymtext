import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getProgramsContext } from '@/lib/context';

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/programs/[id]/versions
 *
 * Create a new version for a program
 */
export async function POST(
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

    const { id: programId } = await context.params;
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

    const {
      templateMarkdown,
      templateStructured,
      generationConfig,
      defaultDurationWeeks,
      difficultyMetadata,
      questions,
    } = body;

    // Create the version using createDraft
    const version = await services.programVersion.createDraft(programId, {
      templateMarkdown: templateMarkdown || null,
      templateStructured: templateStructured || null,
      generationConfig: generationConfig || null,
      defaultDurationWeeks: defaultDurationWeeks || null,
      difficultyMetadata: difficultyMetadata || null,
      questions: questions || null,
    });

    return NextResponse.json({
      success: true,
      data: version,
    }, { status: 201 });
  } catch (error) {
    console.error('[Programs API] Error creating version:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
