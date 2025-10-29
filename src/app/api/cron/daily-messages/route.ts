import { NextResponse } from 'next/server';
import { DailyMessageService } from '@/server/services/orchestration/dailyMessageService';

/**
 * Vercel Cron endpoint for scheduling daily workout messages
 * Runs hourly and schedules Inngest jobs for all users whose local time matches their preferred hour
 *
 * Pattern: Similar to SMS webhook - cron schedules work, Inngest handles execution
 */
export async function GET(request: Request) {
  try {
    // Verify this is a legitimate cron request from Vercel
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

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
    const currentUtcHour = executionTime.getUTCHours();

    console.log('[CRON] Daily messages cron triggered', {
      timestamp: executionTime.toISOString(),
      utcHour: currentUtcHour
    });

    // Delegate scheduling to service
    const dailyMessageService = DailyMessageService.getInstance();
    const { scheduled, failed, duration, errors } = await dailyMessageService.scheduleMessagesForHour(currentUtcHour);

    console.log('[CRON] Daily message scheduling completed:', {
      scheduled,
      failed,
      duration: `${duration}ms`,
      timestamp: executionTime.toISOString()
    });

    // Log any errors for monitoring
    if (errors.length > 0) {
      console.error('[CRON] Daily message scheduling errors:', errors);
    }

    // Return success response with metrics
    return NextResponse.json({
      success: true,
      scheduled,
      failed,
      duration,
      timestamp: executionTime.toISOString()
    });

  } catch (error) {
    console.error('[CRON] Fatal error in daily messages cron:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Export config to set maximum duration for the function
// Should be much faster now since we're just scheduling, not processing
export const maxDuration = 60; // 1 minute should be plenty
