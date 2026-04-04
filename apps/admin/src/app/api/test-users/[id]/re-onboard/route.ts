import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { getAdminPhone } from '@/lib/adminIdentity';
import { inngest } from '@gymtext/shared/server/connections/inngest/client';

/**
 * POST /api/test-users/[id]/re-onboard
 *
 * Re-trigger onboarding for a test user, creating a fresh plan/microcycle/workout.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPhone = await getAdminPhone();
    if (!adminPhone) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { id: userId } = await params;
    const { repos, services } = await getAdminContext();

    // Verify the user exists and belongs to this admin
    const user = await repos.user.findById(userId);
    if (!user || !user.phoneNumber.startsWith(`${adminPhone}_`)) {
      return NextResponse.json({ success: false, error: 'Invalid test user' }, { status: 404 });
    }

    // Reset onboarding
    try {
      await services.onboardingData.delete(userId);
    } catch {
      // Ignore if no existing record
    }

    // Get active enrollment to preserve program ID
    const enrollment = await repos.programEnrollment.findActiveByClientId(userId);
    await services.onboardingData.createOnboardingRecord(userId, {
      programId: enrollment?.programId,
    });

    // Trigger onboarding with forceCreate to regenerate plan
    await inngest.send({
      name: 'user/onboarding.requested',
      data: { userId, forceCreate: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TestUsers] Error re-onboarding test user:', error);
    return NextResponse.json({ success: false, error: 'Failed to re-onboard' }, { status: 500 });
  }
}
