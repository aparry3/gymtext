import { NextResponse } from 'next/server';
import { getAdminContext } from '@/lib/context';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, userIds } = body as { message?: string; userIds?: string[] };

    // Validate inputs
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 1600) {
      return NextResponse.json(
        { success: false, message: `Message too long (${message.length}/1600 chars)` },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'At least one user must be selected' },
        { status: 400 }
      );
    }

    if (userIds.length > 500) {
      return NextResponse.json(
        { success: false, message: `Too many recipients (${userIds.length}/500 max)` },
        { status: 400 }
      );
    }

    const { services } = await getAdminContext();

    console.log('[Admin API] Sending broadcast message:', {
      recipientCount: userIds.length,
      messageLength: message.length,
    });

    const results: { sent: number; failed: number; total: number; failures: { userId: string; error: string }[] } = {
      sent: 0,
      failed: 0,
      total: userIds.length,
      failures: [],
    };

    for (const userId of userIds) {
      try {
        const user = await services.user.getUser(userId);
        if (!user) {
          results.failed++;
          results.failures.push({ userId, error: 'User not found' });
          continue;
        }

        await services.messagingOrchestrator.queueMessage(
          user,
          { content: message },
          'broadcast'
        );
        results.sent++;
      } catch (err) {
        results.failed++;
        results.failures.push({
          userId,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    console.log('[Admin API] Broadcast complete:', results);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred sending broadcast',
      },
      { status: 500 }
    );
  }
}
