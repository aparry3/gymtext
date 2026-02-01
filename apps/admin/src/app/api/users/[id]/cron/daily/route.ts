import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface TriggerRequest {
  forceImmediate?: boolean;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

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

    const { services } = await getAdminContext();
    const result = await services.dailyMessage.triggerForUser(userId, { forceImmediate });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API] Error triggering daily cron for user:', error);

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
