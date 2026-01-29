import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
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
    const programVersion = await services.programVersion.getLatestPublished(programId);

    if (!programVersion) {
      // Program not found or no published version, fall back to base questions
      return NextResponse.json({ questions: baseQuestions });
    }

    // Merge base questions with program questions
    const mergedQuestions = mergeQuestions(programVersion.questions);

    return NextResponse.json({
      questions: mergedQuestions,
      programName: programId, // Could fetch program name if needed
    });
  } catch (error) {
    console.error('[Questions API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load questions' },
      { status: 500 }
    );
  }
}
