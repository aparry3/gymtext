import { NextResponse } from 'next/server';
import { messageQueueService } from '@/server/services/messaging/messageQueueService';
import { getCronSecrets } from '@/server/config';

/**
 * Vercel Cron endpoint for checking stalled message queues
 * Runs every 5 minutes to detect and recover from stuck queues
 *
 * Pattern: Vercel cron triggers this endpoint, which calls the service directly
 */
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request from Vercel
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

    const executionTime = new Date();

    console.log('[CRON] Check stalled queues cron triggered', {
      timestamp: executionTime.toISOString(),
    });

    // Check for stalled messages
    const startTime = Date.now();
    await messageQueueService.checkStalledMessages();
    const duration = Date.now() - startTime;

    console.log('[CRON] Stalled queue check completed:', {
      duration: `${duration}ms`,
      timestamp: executionTime.toISOString(),
    });

    // Return success response with metrics
    return NextResponse.json({
      success: true,
      duration,
      timestamp: executionTime.toISOString(),
    });

  } catch (error) {
    console.error('[CRON] Fatal error in stalled queue check:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export config to set maximum duration for the function
export const maxDuration = 60; // 1 minute should be plenty
