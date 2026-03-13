/**
 * WhatsApp Cloud API Webhook Handler
 *
 * Handles incoming messages and status updates from Meta's WhatsApp Business Cloud API.
 *
 * Supported events:
 *   - Text messages (user replies, STOP/START/HELP commands)
 *   - Reactions (👍 = workout complete, emoji sentiment tracking)
 *   - Template button clicks
 *   - Interactive quick-reply responses
 *   - Delivery status updates (sent/delivered/read/failed)
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/context';
import {
  parseWebhookPayload,
  opensMessagingWindow,
  getWindowTrigger,
  openMessagingWindow,
  isCompletionEmoji,
  getSentiment,
  getAcknowledgmentMessage,
  sendFreeFormIfWindowOpen,
} from '@gymtext/shared/server/whatsapp';
import type {
  WhatsAppWebhookPayload,
  WhatsAppParsedEvent,
  WhatsAppStatusUpdate,
} from '@gymtext/shared/server/whatsapp';

// ---------------------------------------------------------------------------
// Command keywords
// ---------------------------------------------------------------------------

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];
const START_KEYWORDS = ['START', 'UNSTOP', 'RESUME', 'SUBSCRIBE'];
const HELP_KEYWORDS = ['HELP', 'INFO'];

function classifyCommand(text: string): 'stop' | 'start' | 'help' | null {
  const upper = text.trim().toUpperCase();
  if (STOP_KEYWORDS.includes(upper)) return 'stop';
  if (START_KEYWORDS.includes(upper)) return 'start';
  if (HELP_KEYWORDS.includes(upper)) return 'help';
  return null;
}

// ---------------------------------------------------------------------------
// WhatsApp Cloud API config (lazy)
// ---------------------------------------------------------------------------

function getWhatsAppConfig() {
  return {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID!,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN!,
    apiVersion: process.env.WHATSAPP_API_VERSION || 'v23.0',
  };
}

// ---------------------------------------------------------------------------
// GET — Webhook verification
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const mode = params.get('hub.mode');
    const token = params.get('hub.verify_token');
    const challenge = params.get('hub.challenge');

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[WhatsApp Webhook] Verification successful');
      return new NextResponse(challenge, { status: 200 });
    }

    console.error('[WhatsApp Webhook] Verification failed');
    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST — Incoming messages & status updates
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as WhatsAppWebhookPayload;

    // Must respond within 20 seconds — process async
    processWebhook(body).catch((err) => {
      console.error('[WhatsApp Webhook] Async processing error:', err);
    });

    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('[WhatsApp Webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Async processing
// ---------------------------------------------------------------------------

async function processWebhook(body: WhatsAppWebhookPayload): Promise<void> {
  const { events, statuses } = parseWebhookPayload(body);

  const services = getServices();

  // Handle message events
  for (const event of events) {
    try {
      await handleEvent(event, services);
    } catch (err) {
      console.error(`[WhatsApp Webhook] Error handling ${event.type} from ${event.from}:`, err);
    }
  }

  // Handle status updates
  for (const status of statuses) {
    try {
      await handleStatus(status, services);
    } catch (err) {
      console.error(`[WhatsApp Webhook] Error handling status ${status.id}:`, err);
    }
  }
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleEvent(event: WhatsAppParsedEvent, services: any): Promise<void> {
  const phone = event.from.startsWith('+') ? event.from : `+${event.from}`;
  const user = await services.user.getUserByPhone(phone);

  if (!user) {
    console.log(`[WhatsApp Webhook] Unknown user: ${phone}`);
    // TODO: Send sign-up prompt
    return;
  }

  const userWithProfile = await services.user.getUser(user.id);
  if (!userWithProfile) {
    console.error(`[WhatsApp Webhook] Failed to load profile for user ${user.id}`);
    return;
  }

  // Open/refresh 24-hour messaging window for any user interaction
  if (opensMessagingWindow(event)) {
    const trigger = getWindowTrigger(event);
    openMessagingWindow(user.id, phone, trigger);
  }

  switch (event.type) {
    case 'text_message':
      await handleTextMessage(event, userWithProfile, services);
      break;

    case 'reaction_added':
      await handleReactionAdded(event, userWithProfile, services);
      break;

    case 'reaction_removed':
      await handleReactionRemoved(event, userWithProfile, services);
      break;

    case 'button_click':
      await handleButtonClick(event, userWithProfile, services);
      break;

    case 'interactive_reply':
      await handleInteractiveReply(event, userWithProfile, services);
      break;

    default:
      console.log(`[WhatsApp Webhook] Unhandled event type: ${event.type}`);
  }
}

// ---------------------------------------------------------------------------
// Text message handler
// ---------------------------------------------------------------------------

async function handleTextMessage(
  event: WhatsAppParsedEvent,
  user: any,
  services: any
): Promise<void> {
  const text = event.text ?? '';
  const phone = event.from.startsWith('+') ? event.from : `+${event.from}`;

  console.log(`[WhatsApp Webhook] Text from ${phone}: "${text}"`);

  // Check for STOP/START/HELP commands
  const command = classifyCommand(text);

  if (command === 'stop') {
    const result = await services.subscription.cancelSubscription(user.id);
    let msg = "You've been unsubscribed from GymText. Reply START anytime to reactivate.";
    if (result.success && result.periodEndDate) {
      const date = result.periodEndDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      msg = `You've been unsubscribed from GymText. You'll have access until ${date}. Reply START anytime to reactivate.`;
    }
    await services.messagingOrchestrator.sendImmediate(user, msg, undefined, 'whatsapp');
    return;
  }

  if (command === 'start') {
    const result = await services.subscription.reactivateSubscription(user.id);
    let msg = 'Welcome back to GymText! 💪';
    if (result.requiresNewSubscription && result.checkoutUrl) {
      msg = `Your subscription has ended. Resubscribe here: ${result.checkoutUrl}`;
    }
    await services.messagingOrchestrator.sendImmediate(user, msg, undefined, 'whatsapp');
    return;
  }

  if (command === 'help') {
    const msg =
      "Need help? Here's what I can do:\n\n" +
      '• Reply to your workout messages with questions\n' +
      '• React with 👍 when you finish a workout\n' +
      '• Say STOP to pause workouts\n' +
      '• Say START to resume\n\n' +
      'Questions? Just ask!';
    await services.messagingOrchestrator.sendImmediate(user, msg, undefined, 'whatsapp');
    return;
  }

  // Store inbound message
  await services.message.storeInboundMessage({
    clientId: user.id,
    from: phone,
    to: 'whatsapp-business',
    content: text,
    twilioData: {
      MessageSid: event.messageId,
      From: phone,
      Body: text,
      whatsappMessageId: event.messageId,
    },
  });

  // Ingest for agent processing
  const result = await services.message.ingestMessage({
    user,
    content: text,
    from: phone,
    to: 'whatsapp-business',
    twilioData: {
      MessageSid: event.messageId,
      From: phone,
      Body: text,
    },
  });

  console.log(`[WhatsApp Webhook] Message ingested, ack: ${result.ackMessage}`);
}

// ---------------------------------------------------------------------------
// Reaction handlers
// ---------------------------------------------------------------------------

async function handleReactionAdded(
  event: WhatsAppParsedEvent,
  user: any,
  services: any
): Promise<void> {
  const emoji = event.emoji ?? '';
  const reactedTo = event.reactedToMessageId ?? '';

  console.log(`[WhatsApp Webhook] Reaction ${emoji} from user ${user.id} on message ${reactedTo}`);

  // Check if this is a workout completion reaction
  if (isCompletionEmoji(emoji)) {
    const sentiment = getSentiment(emoji);

    if (sentiment) {
      // Look up which workout message this corresponds to
      // The reactedToMessageId is the WhatsApp message ID we sent
      const message = await services.message.getMessageByProviderId?.(reactedTo);

      if (message) {
        console.log(`[WhatsApp Webhook] Marking workout complete for user ${user.id}, sentiment: ${sentiment}`);

        // Store the completion event
        await services.message.storeInboundMessage({
          clientId: user.id,
          from: event.from.startsWith('+') ? event.from : `+${event.from}`,
          to: 'whatsapp-business',
          content: `[Reaction: ${emoji}]`,
          twilioData: {
            MessageSid: event.messageId,
            From: event.from,
            Body: `[Reaction: ${emoji}]`,
            whatsappReaction: { emoji, messageId: reactedTo, sentiment },
          },
        });
      }

      // Send acknowledgment (free-form if window is open, which it should be
      // since the reaction just opened it)
      const ackMessage = getAcknowledgmentMessage(sentiment);
      const config = getWhatsAppConfig();

      const freeResult = await sendFreeFormIfWindowOpen(
        user.id,
        event.from,
        ackMessage,
        config
      );

      if (!freeResult) {
        // Fallback to orchestrator (which will use template)
        await services.messagingOrchestrator.sendImmediate(user, ackMessage, undefined, 'whatsapp');
      }
    }
  }
}

async function handleReactionRemoved(
  event: WhatsAppParsedEvent,
  user: any,
  services: any
): Promise<void> {
  const reactedTo = event.reactedToMessageId ?? '';
  console.log(`[WhatsApp Webhook] Reaction removed by user ${user.id} on message ${reactedTo}`);

  // Log the removal but don't undo completion
  // Users might accidentally remove reactions; we keep the completion
}

// ---------------------------------------------------------------------------
// Button click handler
// ---------------------------------------------------------------------------

async function handleButtonClick(
  event: WhatsAppParsedEvent,
  user: any,
  services: any
): Promise<void> {
  console.log(
    `[WhatsApp Webhook] Button click from user ${user.id}: "${event.buttonText}" (payload: ${event.buttonPayload})`
  );

  // Store as inbound interaction
  await services.message.storeInboundMessage({
    clientId: user.id,
    from: event.from.startsWith('+') ? event.from : `+${event.from}`,
    to: 'whatsapp-business',
    content: `[Button: ${event.buttonText}]`,
    twilioData: {
      MessageSid: event.messageId,
      From: event.from,
      Body: `[Button: ${event.buttonText}]`,
      whatsappButton: { text: event.buttonText, payload: event.buttonPayload },
    },
  });

  // Button clicks open the 24h window (already handled above)
  // The URL button itself handles navigation — no server action needed
}

// ---------------------------------------------------------------------------
// Interactive reply handler (quick replies)
// ---------------------------------------------------------------------------

async function handleInteractiveReply(
  event: WhatsAppParsedEvent,
  user: any,
  services: any
): Promise<void> {
  console.log(
    `[WhatsApp Webhook] Interactive reply from user ${user.id}: "${event.replyTitle}" (id: ${event.replyId})`
  );

  // Store as inbound
  await services.message.storeInboundMessage({
    clientId: user.id,
    from: event.from.startsWith('+') ? event.from : `+${event.from}`,
    to: 'whatsapp-business',
    content: event.replyTitle ?? '',
    twilioData: {
      MessageSid: event.messageId,
      From: event.from,
      Body: event.replyTitle ?? '',
      whatsappInteractive: { id: event.replyId, title: event.replyTitle },
    },
  });

  // Ingest for agent processing (treat as text reply)
  await services.message.ingestMessage({
    user,
    content: event.replyTitle ?? '',
    from: event.from.startsWith('+') ? event.from : `+${event.from}`,
    to: 'whatsapp-business',
    twilioData: {
      MessageSid: event.messageId,
      From: event.from,
      Body: event.replyTitle ?? '',
    },
  });
}

// ---------------------------------------------------------------------------
// Status update handler
// ---------------------------------------------------------------------------

async function handleStatus(status: WhatsAppStatusUpdate, services: any): Promise<void> {
  console.log(`[WhatsApp Webhook] Status: ${status.status} for message ${status.id}`);

  let deliveryStatus: 'sent' | 'delivered' | 'failed' = 'sent';
  if (status.status === 'delivered' || status.status === 'read') {
    deliveryStatus = 'delivered';
  } else if (status.status === 'failed') {
    deliveryStatus = 'failed';

    // Log error details
    if (status.errors?.length) {
      console.error('[WhatsApp Webhook] Delivery error:', status.errors);
    }
  }

  try {
    await services.message.updateMessageStatusByProviderId(status.id, deliveryStatus);
  } catch (err) {
    // Non-critical — message might not exist in our DB
    console.warn(`[WhatsApp Webhook] Could not update status for ${status.id}:`, err);
  }

  // If delivered/read, trigger queue advancement (handle delivery confirmation)
  if (deliveryStatus === 'delivered') {
    try {
      await services.messagingOrchestrator.handleDeliveryConfirmation(status.id);
    } catch (err) {
      // Non-critical
      console.warn(`[WhatsApp Webhook] Could not confirm delivery for ${status.id}:`, err);
    }
  }
}
