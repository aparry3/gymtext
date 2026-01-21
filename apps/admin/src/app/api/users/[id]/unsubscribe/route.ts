import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    // Verify user exists
    const user = await services.user.getUser(userId);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Step 1: Cancel all pending messages first (prevents race conditions)
    let messagesCanceled = 0;
    try {
      messagesCanceled = await services.messagingOrchestrator.cancelAllPendingMessages(userId);
    } catch (error) {
      console.error(`[Unsubscribe] Error canceling messages for user ${userId}:`, error);
      // Continue with subscription cancellation even if message cleanup fails
    }

    // Step 2: Immediately cancel subscription (with prorated refund)
    const subscriptionResult = await services.subscription.immediatelyCancelSubscription(userId);

    if (!subscriptionResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: subscriptionResult.error || 'Failed to cancel subscription',
          data: {
            messagesCanceled,
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User unsubscribed successfully',
      data: {
        messagesCanceled,
        subscriptionCanceledAt: subscriptionResult.canceledAt,
      }
    });

  } catch (error) {
    console.error('Error unsubscribing user:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred unsubscribing user'
      },
      { status: 500 }
    );
  }
}
