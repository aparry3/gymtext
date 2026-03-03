import { NextResponse } from 'next/server';
import { inngest } from '@gymtext/shared/server/connections/inngest/client';
import type { RegenerationStep } from '@gymtext/shared/server';

/**
 * POST /api/users/[id]/regenerate
 *
 * Queues regeneration of profile/plan/week for a single user via Inngest.
 * Body: { steps?: ("profile" | "plan" | "week")[] } — defaults to all steps.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    await inngest.send({
      name: 'user/regeneration.requested',
      data: { userId, steps: body.steps },
    });

    return NextResponse.json({
      success: true,
      message: 'Regeneration queued',
    });
  } catch (error) {
    console.error('[REGENERATE] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
