import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';
import { inngest } from '@gymtext/shared/server/connections/inngest/client';

/**
 * POST /api/users/regenerate
 *
 * Bulk regeneration for all active users with profiles.
 * Fans out one Inngest event per user for parallel, isolated processing.
 */
export async function POST() {
  try {
    const { services } = await getAdminContext();
    const userIds = await services.user.getUserIdsWithProfiles();

    const events = userIds.map(userId => ({
      name: 'user/regeneration.requested' as const,
      data: { userId },
    }));

    await inngest.send(events);

    return NextResponse.json({
      success: true,
      message: `Queued regeneration for ${userIds.length} users`,
      total: userIds.length,
    });
  } catch (error) {
    console.error('[REGENERATE_ALL] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
