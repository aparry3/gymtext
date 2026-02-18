/**
 * WhatsApp Cloud API Webhook Handler
 *
 * Handles incoming messages and status updates from Meta's WhatsApp Business Cloud API.
 *
 * This endpoint serves two purposes:
 * 1. GET - Webhook verification (Meta sends verification request during setup)
 * 2. POST - Incoming messages and status updates
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME'];

function isStopCommand(message: string): boolean {
  return STOP_KEYWORDS.includes(message.trim().toUpperCase());
}

function isStartCommand(message: string): boolean {
  return START_KEYWORDS.includes(message.trim().toUpperCase());
}

/**
 * GET handler for webhook verification
 *
 * Meta sends a GET request with hub.mode, hub.verify_token, and hub.challenge
 * We must respond with the challenge value if the verify token matches.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    console.log('[WhatsApp Webhook] Verification request received:', { mode, token });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification successful!');
      return new NextResponse(challenge, { status: 200 });
    } else {
      console.error('[WhatsApp Webhook] Verification failed! Invalid token or mode.');
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
    }
  } catch (error) {
    console.error('[WhatsApp Webhook] Error during verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST handler for incoming messages and status updates
 *
 * Meta sends webhook events as POST requests with a JSON payload.
 * Event types include:
 * - messages: Incoming messages from users
 * - message_status: Delivery status updates (sent, delivered, read, failed)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Acknowledge receipt immediately (Meta requires response within 20 seconds)
    // Process webhook events asynchronously after responding

    console.log('[WhatsApp Webhook] Received webhook:', JSON.stringify(body, null, 2));

    if (body.object !== 'whatsapp_business_account') {
      console.warn('[WhatsApp Webhook] Unknown object type:', body.object);
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    // Process entries asynchronously (don't block response)
    processWebhookEntries(body.entry).catch((error) => {
      console.error('[WhatsApp Webhook] Error processing entries:', error);
    });

    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Process webhook entries asynchronously
 *
 * Handles both incoming messages and status updates.
 */
async function processWebhookEntries(entries: any[]): Promise<void> {
  const services = getServices();

  for (const entry of entries) {
    const changes = entry.changes || [];

    for (const change of changes) {
      if (change.field !== 'messages') {
        console.log('[WhatsApp Webhook] Ignoring non-message field:', change.field);
        continue;
      }

      const value = change.value;

      // Handle incoming messages
      if (value.messages) {
        await handleIncomingMessages(value, services);
      }

      // Handle status updates
      if (value.statuses) {
        await handleStatusUpdates(value.statuses, services);
      }
    }
  }
}

/**
 * Handle incoming messages from users
 */
async function handleIncomingMessages(value: any, services: any): Promise<void> {
  const messages = value.messages || [];
  const contacts = value.contacts || [];

  for (const message of messages) {
    const fromPhone = message.from; // E.164 format: 15551234567
    const messageId = message.id;
    const timestamp = message.timestamp;
    const messageType = message.type; // 'text', 'image', 'audio', 'video', 'document', etc.

    // Get message content based on type
    let messageText = '';
    if (messageType === 'text') {
      messageText = message.text?.body || '';
    } else if (messageType === 'button') {
      messageText = message.button?.text || '';
    } else if (messageType === 'interactive') {
      // Handle quick reply or list reply
      messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
    } else {
      console.log(`[WhatsApp Webhook] Unsupported message type: ${messageType}`);
      continue;
    }

    // Get user contact info
    const contact = contacts.find((c: any) => c.wa_id === fromPhone);
    const userName = contact?.profile?.name;

    console.log('[WhatsApp Webhook] Incoming message:', {
      from: fromPhone,
      name: userName,
      type: messageType,
      text: messageText,
      messageId,
    });

    // Format phone number (add + prefix for E.164)
    const phoneNumber = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;

    // Look up user by phone number
    const user = await services.user.getUserByPhone(phoneNumber);

    if (!user) {
      console.log('[WhatsApp Webhook] User not found for phone:', phoneNumber);
      // Send sign-up message
      await sendSignUpMessage(fromPhone);
      continue;
    }

    const userWithProfile = await services.user.getUser(user.id);

    if (!userWithProfile) {
      console.error('[WhatsApp Webhook] Failed to load user profile:', user.id);
      continue;
    }

    // Handle STOP/START commands
    if (isStopCommand(messageText)) {
      await handleStopCommand(userWithProfile, fromPhone, services);
      continue;
    }

    if (isStartCommand(messageText)) {
      await handleStartCommand(userWithProfile, fromPhone, services);
      continue;
    }

    // Store inbound message
    await services.message.storeInboundMessage({
      clientId: user.id,
      from: phoneNumber,
      to: value.metadata?.display_phone_number || 'whatsapp-business',
      content: messageText,
      twilioData: {
        MessageSid: messageId,
        From: phoneNumber,
        Body: messageText,
        whatsappMessageId: messageId,
        whatsappMetadata: value.metadata,
      },
    });

    // Ingest message for chat agent processing
    const result = await services.message.ingestMessage({
      user: userWithProfile,
      content: messageText,
      from: phoneNumber,
      to: value.metadata?.display_phone_number || 'whatsapp-business',
      twilioData: {
        MessageSid: messageId,
        From: phoneNumber,
        Body: messageText,
      },
    });

    console.log('[WhatsApp Webhook] Message ingested, ack:', result.ackMessage);
  }
}

/**
 * Handle status updates for sent messages
 */
async function handleStatusUpdates(statuses: any[], services: any): Promise<void> {
  for (const status of statuses) {
    const messageId = status.id;
    const statusValue = status.status; // 'sent', 'delivered', 'read', 'failed'
    const timestamp = status.timestamp;
    const recipientId = status.recipient_id;

    console.log('[WhatsApp Webhook] Status update:', {
      messageId,
      status: statusValue,
      timestamp,
      recipientId,
    });

    // Update message delivery status
    // Map WhatsApp status to internal status
    let deliveryStatus: 'sent' | 'delivered' | 'failed' = 'sent';
    if (statusValue === 'delivered' || statusValue === 'read') {
      deliveryStatus = 'delivered';
    } else if (statusValue === 'failed') {
      deliveryStatus = 'failed';
    }

    // Find message by provider message ID and update status
    // Note: This requires the message to be stored with the WhatsApp message ID
    try {
      await services.message.updateMessageStatusByProviderId(messageId, deliveryStatus);
    } catch (error) {
      console.error('[WhatsApp Webhook] Failed to update message status:', error);
    }
  }
}

/**
 * Handle STOP command (unsubscribe)
 */
async function handleStopCommand(user: any, fromPhone: string, services: any): Promise<void> {
  console.log('[WhatsApp Webhook] Processing STOP command for user:', user.id);

  const result = await services.subscription.cancelSubscription(user.id);

  let confirmationMessage: string;
  if (result.success && result.periodEndDate) {
    const formattedDate = result.periodEndDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
    confirmationMessage = `You've been unsubscribed from GymText. You'll have access until ${formattedDate}. Reply START anytime to reactivate.`;
  } else {
    confirmationMessage = `Sorry, there was an issue. Please contact support.`;
  }

  // Send confirmation via WhatsApp Cloud API
  await services.messagingOrchestrator.sendImmediate(
    user,
    confirmationMessage,
    undefined,
    'whatsapp'
  );
}

/**
 * Handle START command (resubscribe)
 */
async function handleStartCommand(user: any, fromPhone: string, services: any): Promise<void> {
  console.log('[WhatsApp Webhook] Processing START command for user:', user.id);

  const result = await services.subscription.reactivateSubscription(user.id);

  let confirmationMessage = 'Welcome back to GymText!';
  if (result.requiresNewSubscription && result.checkoutUrl) {
    confirmationMessage = `Your subscription has ended. Resubscribe here: ${result.checkoutUrl}`;
  }

  await services.messagingOrchestrator.sendImmediate(
    user,
    confirmationMessage,
    undefined,
    'whatsapp'
  );
}

/**
 * Send sign-up message to unknown phone number
 */
async function sendSignUpMessage(toPhone: string): Promise<void> {
  // TODO: Implement sign-up message using WhatsApp Cloud API
  // For now, just log
  console.log('[WhatsApp Webhook] Would send sign-up message to:', toPhone);
}
