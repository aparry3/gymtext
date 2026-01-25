import { NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
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

    // Check for stalled queue entries (processing status)
    const services = getServices();
    const startTime = Date.now();
    await services.messagingOrchestrator.checkStalledMessages();
    const stalledDuration = Date.now() - startTime;

    console.log('[CRON] Stalled queue check completed:', {
      duration: `${stalledDuration}ms`,
      timestamp: executionTime.toISOString(),
    });

    // Clean up stuck messages (queued/sent status older than 24 hours)
    const cleanupStartTime = Date.now();
    const cleanupResult = await services.messagingOrchestrator.cleanupStuckMessages();
    const cleanupDuration = Date.now() - cleanupStartTime;

    console.log('[CRON] Stuck message cleanup completed:', {
      duration: `${cleanupDuration}ms`,
      cleaned: cleanupResult.cleaned,
      delivered: cleanupResult.delivered,
      failed: cleanupResult.failed,
      timestamp: executionTime.toISOString(),
    });

    const totalDuration = Date.now() - startTime;

    // Return success response with metrics
    return NextResponse.json({
      success: true,
      duration: totalDuration,
      stalledDuration,
      cleanupDuration,
      cleanupResult,
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
