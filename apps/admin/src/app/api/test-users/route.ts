import { NextRequest, NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { getAdminPhone } from '@/lib/adminIdentity';

/**
 * GET /api/test-users
 *
 * List all test users for the current admin (phone suffixed with _<slug>).
 */
export async function GET() {
  try {
    const adminPhone = await getAdminPhone();
    if (!adminPhone) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { repos, services } = await getAdminContext();

    // Find all users whose phone starts with the admin's phone + '_'
    const prefix = `${adminPhone}_`;
    const allUsers = await repos.db
      .selectFrom('users')
      .selectAll()
      .where('phoneNumber', 'like', `${prefix}%`)
      .orderBy('createdAt', 'desc')
      .execute();

    // Get enrollment and active test routing info
    const activeTestUserId = await repos.adminTestRouting.getActiveTestUserId(adminPhone);

    const testUsers = await Promise.all(
      allUsers.map(async (user) => {
        const enrollment = await repos.programEnrollment.findActiveByClientId(user.id);
        let programName: string | null = null;
        if (enrollment) {
          const program = await repos.program.findById(enrollment.programId);
          programName = program?.name ?? null;
        }
        const onboardingStatus = await services.onboardingData.getStatus(user.id);

        return {
          id: user.id,
          name: user.name,
          phoneNumber: user.phoneNumber,
          slug: user.phoneNumber.slice(prefix.length),
          programName,
          programId: enrollment?.programId ?? null,
          enrollmentStatus: enrollment?.status ?? null,
          onboardingStatus,
          isActive: user.id === activeTestUserId,
          createdAt: user.createdAt,
        };
      })
    );

    return NextResponse.json({ success: true, data: testUsers });
  } catch (error) {
    console.error('[TestUsers] Error listing test users:', error);
    return NextResponse.json({ success: false, error: 'Failed to list test users' }, { status: 500 });
  }
}

/**
 * PUT /api/test-users
 *
 * Set the active test user for inbound SMS routing.
 * Body: { userId: string | null }  (null to clear)
 */
export async function PUT(req: NextRequest) {
  try {
    const adminPhone = await getAdminPhone();
    if (!adminPhone) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { userId } = await req.json();
    const { repos } = await getAdminContext();

    if (userId) {
      // Verify the user exists and belongs to this admin
      const user = await repos.user.findById(userId);
      if (!user || !user.phoneNumber.startsWith(`${adminPhone}_`)) {
        return NextResponse.json({ success: false, error: 'Invalid test user' }, { status: 400 });
      }
      await repos.adminTestRouting.setActiveTestUser(adminPhone, userId);
    } else {
      await repos.adminTestRouting.clearActiveTestUser(adminPhone);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[TestUsers] Error setting active test user:', error);
    return NextResponse.json({ success: false, error: 'Failed to update active test user' }, { status: 500 });
  }
}
