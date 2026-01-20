import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Cancel a message or queue entry
 *
 * POST /api/messages/[id]/cancel
 *
 * Request body:
 * - source: 'queue' | 'message' - Whether to cancel by queue entry ID or message ID
 *
 * The endpoint will:
 * 1. Find the queue entry (directly if source='queue', by messageId if source='message')
 * 2. Validate the entry is cancellable (pending or sent status)
 * 3. Mark the queue entry as cancelled
 * 4. Mark the linked message as cancelled (if any)
 * 5. Trigger processing of the next message in the queue
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { source } = body;

    if (!source || (source !== 'queue' && source !== 'message')) {
      return NextResponse.json(
        { success: false, message: 'Invalid source. Must be "queue" or "message"' },
        { status: 400 }
      );
    }

    const { services, repos } = await getAdminContext();

    let queueEntryId: string;

    if (source === 'queue') {
      // The ID is a queue entry ID
      queueEntryId = id;
    } else {
      // The ID is a message ID - find the associated queue entry
      const queueEntry = await repos.messageQueue.findByMessageId(id);
      if (!queueEntry) {
        return NextResponse.json(
          { success: false, message: 'No queue entry found for this message' },
          { status: 404 }
        );
      }
      queueEntryId = queueEntry.id;
    }

    // Cancel the queue entry
    const result = await services.messageQueue.cancelQueueEntry(queueEntryId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to cancel message' },
        { status: 400 }
      );
    }

    console.log('[Admin API] Message cancelled:', {
      id,
      source,
      queueEntryId,
    });

    return NextResponse.json({
      success: true,
      message: 'Message cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling message:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred cancelling message',
      },
      { status: 500 }
    );
  }
}
