import { NextResponse } from 'next/server';
import { dailyMessageService } from '@/server/services';

/**
 * Vercel Cron endpoint for sending daily workout messages
 * Runs hourly and processes all users whose local time matches their preferred hour
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
    console.log('[CRON] Daily messages cron triggered', {
      timestamp: executionTime.toISOString()
    });

    // Process the hourly batch
    const result = await dailyMessageService.processHourlyBatch();

    console.log('[CRON] Daily messages completed:', {
      processed: result.processed,
      failed: result.failed,
      duration: `${result.duration}ms`,
      timestamp: executionTime.toISOString()
    });

    // Log any errors for monitoring
    if (result.errors.length > 0) {
      console.error('[CRON] Daily message errors:', result.errors);
    }

    // Return success response with metrics
    return NextResponse.json({
      success: true,
      processed: result.processed,
      failed: result.failed,
      duration: result.duration,
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
export const maxDuration = 300; // 5 minutes (max for Vercel Hobby plan)
