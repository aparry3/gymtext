import { MessageRepository } from '@/server/repositories/messageRepository';
import { inngest } from '@/server/connections/inngest/client';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { postgresDb } from '@/server/connections/postgres/postgres';

export async function POST(req: NextRequest) {
  try {
    // Parse the form data from Twilio
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    // Extract status information
    const messageSid = body.MessageSid as string;
    const messageStatus = body.MessageStatus as string;
    const errorCode = body.ErrorCode as string | undefined;
    const errorMessage = body.ErrorMessage as string | undefined;

    console.log('[Twilio Status Callback]', {
      messageSid,
      messageStatus,
      errorCode,
      errorMessage,
    });

    if (!messageSid || !messageStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Optional: Validate Twilio signature for security
    // Note: This requires TWILIO_AUTH_TOKEN and the full URL
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (authToken) {
      const signature = req.headers.get('x-twilio-signature');
      const url = `${process.env.BASE_URL}/api/twilio/status`;

      if (signature && url) {
        const params: Record<string, string> = {};
        formData.forEach((value, key) => {
          params[key] = value.toString();
        });

        const isValid = twilio.validateRequest(
          authToken,
          signature,
          url,
          params
        );

        if (!isValid) {
          console.error('[Twilio Status Callback] Invalid signature');
          return NextResponse.json(
            { error: 'Invalid signature' },
            { status: 403 }
          );
        }
      }
    }

    // Update message delivery status
    const messageRepo = new MessageRepository(postgresDb);
    const message = await messageRepo.findByProviderMessageId(messageSid);

    if (!message) {
      console.warn('[Twilio Status Callback] Message not found:', messageSid);
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    // Build error message if present
    const deliveryError = errorCode
      ? `${errorCode}${errorMessage ? `: ${errorMessage}` : ''}`
      : undefined;

    // Update the message
    await messageRepo.updateDeliveryStatus(
      message.id,
      messageStatus as 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered',
      deliveryError
    );

    console.log('[Twilio Status Callback] Updated message:', {
      messageId: message.id,
      status: messageStatus,
    });

    // Handle message queue processing
    // Import here to avoid circular dependency at module level
    const { messageQueueService } = await import('@/server/services/messaging/messageQueueService');

    if (messageStatus === 'delivered') {
      // Mark as delivered in queue and trigger next message
      console.log('[Twilio Status Callback] Message delivered, processing queue');
      await messageQueueService.markMessageDelivered(message.id);
    } else if (messageStatus === 'failed' || messageStatus === 'undelivered') {
      // Handle failure in queue (retry or skip)
      console.log('[Twilio Status Callback] Message failed, handling in queue');
      await messageQueueService.markMessageFailed(message.id, deliveryError);

      // Also trigger the existing retry mechanism for non-queued messages
      await inngest.send({
        name: 'message/delivery-failed',
        data: {
          messageId: message.id,
          userId: message.userId,
          providerMessageId: messageSid,
          error: deliveryError || 'Unknown error',
        },
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[Twilio Status Callback] Error processing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
