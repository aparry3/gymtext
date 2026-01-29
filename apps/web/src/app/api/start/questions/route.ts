import { NextRequest, NextResponse } from 'next/server';
import { getServices, getRepositories } from '@/lib/context';
import { baseQuestions } from '@/lib/questionnaire/baseQuestions';
import { mergeQuestions } from '@/lib/questionnaire/mergeQuestions';

/**
 * GET /api/start/questions
 *
 * Returns the questionnaire questions, optionally including program-specific questions.
 *
 * Query params:
 * - programId: Optional program ID to include program-specific questions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const programId = searchParams.get('programId');

    if (!programId) {
      // No program, return base questions only
      return NextResponse.json({ questions: baseQuestions });
    }

    // Fetch program and its questions
    const services = getServices();
    const repos = getRepositories();
    const programVersion = await services.programVersion.getLatestPublished(programId);

    if (!programVersion) {
      // Program not found or no published version, fall back to base questions
      return NextResponse.json({ questions: baseQuestions });
    }

    // Fetch program and owner details for branding
    const program = await repos.program.findById(programId);
    const owner = program ? await repos.programOwner.findById(program.ownerId) : null;

    // Merge base questions with program questions
    const mergedQuestions = mergeQuestions(programVersion.questions);

    return NextResponse.json({
      questions: mergedQuestions,
      programName: program?.name || programId,
      ownerWordmarkUrl: owner?.wordmarkUrl || null,
      ownerDisplayName: owner?.displayName || null,
    });
  } catch (error) {
    console.error('[Questions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
