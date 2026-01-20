import { inngest } from '@/server/connections/inngest/client';
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { getTwilioSecrets } from '@/server/config';
import { getUrlsConfig } from '@/shared/config';
import { getServices, getRepositories } from '@/lib/context';
import { isUnsubscribedError } from '@/server/utils/twilioErrors';

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
    const { authToken } = getTwilioSecrets();
    const { baseUrl } = getUrlsConfig();
    if (authToken && baseUrl) {
      const signature = req.headers.get('x-twilio-signature');
      const url = `${baseUrl}/api/twilio/status`;

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

    // Get repositories and services
    const repos = getRepositories();
    const services = getServices();

    // Update message delivery status
    const message = await repos.message.findByProviderMessageId(messageSid);

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
    await repos.message.updateDeliveryStatus(
      message.id,
      messageStatus as 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered',
      deliveryError
    );

    console.log('[Twilio Status Callback] Updated message:', {
      messageId: message.id,
      status: messageStatus,
    });

    // Handle message queue processing
    if (messageStatus === 'delivered') {
      // Mark as delivered in queue and trigger next message
      console.log('[Twilio Status Callback] Message delivered, processing queue');
      await services.messageQueue.markMessageDelivered(message.id);
    } else if (messageStatus === 'failed' || messageStatus === 'undelivered') {
      // Check if this is a 21610 (user unsubscribed) error
      if (isUnsubscribedError(deliveryError)) {
        console.log('[Twilio Status Callback] User unsubscribed (21610), canceling subscription:', {
          clientId: message.clientId,
          messageId: message.id,
          errorCode,
        });

        // Cancel the user's subscription
        try {
          await services.subscription.immediatelyCancelSubscription(message.clientId);
          console.log('[Twilio Status Callback] Subscription canceled for unsubscribed user:', message.clientId);
        } catch (cancelError) {
          console.error('[Twilio Status Callback] Failed to cancel subscription:', cancelError);
        }

        // Cancel all pending messages for this user
        try {
          const cancelledCount = await services.messageQueue.cancelAllPendingMessages(message.clientId);
          console.log(`[Twilio Status Callback] Cancelled ${cancelledCount} pending messages for unsubscribed user`);
        } catch (cancelError) {
          console.error('[Twilio Status Callback] Failed to cancel pending messages:', cancelError);
        }
      }

      // Handle failure in queue (retry or skip)
      console.log('[Twilio Status Callback] Message failed, handling in queue');
      await services.messageQueue.markMessageFailed(message.id, deliveryError);

      // Also trigger the existing retry mechanism for non-queued messages
      await inngest.send({
        name: 'message/delivery-failed',
        data: {
          messageId: message.id,
          clientId: message.clientId,
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
