import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

/**
 * Admin endpoint to clean up stuck messages
 *
 * POST /api/messages/cleanup-stuck
 *
 * Processes messages stuck in 'queued' or 'sent' status for more than 24 hours.
 * Queries Twilio for actual status and updates accordingly.
 *
 * Supports optional query params:
 * - maxBatches: Maximum number of batches to process (default: 10)
 *
 * Each batch processes up to 100 messages with a small delay between batches
 * to avoid Twilio rate limits.
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const maxBatches = parseInt(searchParams.get('maxBatches') || '10', 10);

    const { services } = await getAdminContext();

    console.log('[Admin] Starting stuck message cleanup, maxBatches:', maxBatches);

    let totalCleaned = 0;
    let totalDelivered = 0;
    let totalFailed = 0;
    let batchesProcessed = 0;

    // Process in batches with delays to avoid rate limits
    for (let batch = 0; batch < maxBatches; batch++) {
      const result = await services.messagingOrchestrator.cleanupStuckMessages();

      totalCleaned += result.cleaned;
      totalDelivered += result.delivered;
      totalFailed += result.failed;
      batchesProcessed++;

      console.log(`[Admin] Batch ${batch + 1} complete:`, result);

      // If no messages were cleaned, we're done
      if (result.cleaned === 0) {
        console.log('[Admin] No more stuck messages to clean up');
        break;
      }

      // Small delay between batches to avoid Twilio rate limits
      if (batch < maxBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log('[Admin] Stuck message cleanup complete:', {
      batchesProcessed,
      totalCleaned,
      totalDelivered,
      totalFailed,
    });

    return NextResponse.json({
      success: true,
      data: {
        batchesProcessed,
        totalCleaned,
        totalDelivered,
        totalFailed,
      },
    });
  } catch (error) {
    console.error('[Admin] Error during stuck message cleanup:', error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred during cleanup',
      },
      { status: 500 }
    );
  }
}

// Allow longer execution time for processing many messages
export const maxDuration = 300; // 5 minutes
