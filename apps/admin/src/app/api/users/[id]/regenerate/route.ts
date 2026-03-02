import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import type { RegenerationStep } from '@gymtext/shared/server';

/**
 * POST /api/users/[id]/regenerate
 *
 * Regenerates profile/plan/week for a single user using the dossier pipeline.
 * Body: { steps?: ("profile" | "plan" | "week")[] } — defaults to all steps.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();

  try {
    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    let body: { steps?: RegenerationStep[] } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine
    }

    const { services } = await getAdminContext();
    const results = await services.regeneration.regenerateUser(userId, body.steps);
    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      data: results,
      executionTimeMs,
    });
  } catch (error) {
    console.error('[REGENERATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
