import { NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import { getCronSecrets } from '@/server/config';

interface TriggerRequest {
  forceImmediate?: boolean;
}

/**
 * Endpoint for triggering daily workout message for a specific user
 * Called by admin app to trigger messages for individual users
 *
 * @param forceImmediate - If true, triggers regardless of time/eligibility checks (defaults to true)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify this is a legitimate request
    const authHeader = request.headers.get('authorization');
    const { cronSecret } = getCronSecrets();

    if (!cronSecret) {
      console.error('[CRON] CRON_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { success: false, reason: 'User ID is required' },
        { status: 400 }
      );
    }

    let body: TriggerRequest = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is fine, use defaults
    }

    const forceImmediate = body.forceImmediate ?? true;

    console.log(`[CRON] Triggering daily message for user ${userId}`, { forceImmediate });

    const services = getServices();
    const result = await services.dailyMessage.triggerForUser(userId, { forceImmediate });

    console.log(`[CRON] Daily message trigger result for user ${userId}:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[CRON] Error triggering daily message for user:', error);

    return NextResponse.json(
      {
        success: false,
        scheduled: false,
        reason: error instanceof Error ? error.message : 'An error occurred',
      },
      { status: 500 }
    );
  }
}

export const maxDuration = 60;
