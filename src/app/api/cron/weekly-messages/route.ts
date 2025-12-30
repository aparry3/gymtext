import { NextResponse } from 'next/server';
import { WeeklyMessageService } from '@/server/services/orchestration/weeklyMessageService';
import { getCronSecrets } from '@/server/config';

/**
 * Vercel Cron endpoint for scheduling weekly check-in messages
 * Runs hourly on Sundays and schedules Inngest jobs for all users whose local time matches their preferred hour
 *
 * Pattern: Similar to daily-messages - cron schedules work, Inngest handles execution
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
    const currentUtcHour = executionTime.getUTCHours();

    console.log('[CRON] Weekly messages cron triggered', {
      timestamp: executionTime.toISOString(),
      utcHour: currentUtcHour,
      dayOfWeek: executionTime.toLocaleDateString('en-US', { weekday: 'long' })
    });

    // Delegate scheduling to service
    const weeklyMessageService = WeeklyMessageService.getInstance();
    const { scheduled, failed, duration, errors } = await weeklyMessageService.scheduleMessagesForHour(currentUtcHour);

    console.log('[CRON] Weekly message scheduling completed:', {
      scheduled,
      failed,
      duration: `${duration}ms`,
      timestamp: executionTime.toISOString()
    });

    // Log any errors for monitoring
    if (errors.length > 0) {
      console.error('[CRON] Weekly message scheduling errors:', errors);
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
    console.error('[CRON] Fatal error in weekly messages cron:', error);

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
