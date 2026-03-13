/**
 * WhatsApp Webhook Parser
 *
 * Parses raw WhatsApp Cloud API webhook payloads into typed, normalized events.
 * Handles all message types: text, reactions, button clicks, interactive replies, and statuses.
 */

import type {
  WhatsAppWebhookPayload,
  WhatsAppInboundMessage,
  WhatsAppParsedEvent,
  WhatsAppEventType,
  WhatsAppStatusUpdate,
  WhatsAppWebhookValue,
  WhatsAppContact,
} from './types';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ParsedWebhookResult {
  events: WhatsAppParsedEvent[];
  statuses: WhatsAppStatusUpdate[];
}

/**
 * Parse a raw webhook payload into structured events.
 *
 * Returns both message events (text, reaction, button, etc.) and status updates
 * so callers can handle them separately.
 */
export function parseWebhookPayload(body: WhatsAppWebhookPayload): ParsedWebhookResult {
  const events: WhatsAppParsedEvent[] = [];
  const statuses: WhatsAppStatusUpdate[] = [];

  if (body.object !== 'whatsapp_business_account') {
    return { events, statuses };
  }

  for (const entry of body.entry) {
    for (const change of entry.changes) {
      if (change.field !== 'messages') continue;

      const value = change.value;

      // Parse messages
      if (value.messages) {
        for (const msg of value.messages) {
          const parsed = parseMessage(msg, value);
          if (parsed) events.push(parsed);
        }
      }

      // Collect statuses
      if (value.statuses) {
        statuses.push(...value.statuses);
      }
    }
  }

  return { events, statuses };
}

// ---------------------------------------------------------------------------
// Internal parsers
// ---------------------------------------------------------------------------

function parseMessage(
  msg: WhatsAppInboundMessage,
  value: WhatsAppWebhookValue
): WhatsAppParsedEvent | null {
  const contact = findContact(msg.from, value.contacts);
  const base = {
    from: msg.from,
    messageId: msg.id,
    timestamp: new Date(parseInt(msg.timestamp, 10) * 1000),
    contactName: contact?.profile?.name,
  };

  switch (msg.type) {
    case 'text':
      return {
        ...base,
        type: 'text_message',
        text: msg.text?.body ?? '',
      };

    case 'reaction':
      if (!msg.reaction) return null;
      if (msg.reaction.emoji) {
        return {
          ...base,
          type: 'reaction_added',
          reactedToMessageId: msg.reaction.message_id,
          emoji: msg.reaction.emoji,
        };
      } else {
        // Reaction removed (no emoji field)
        return {
          ...base,
          type: 'reaction_removed',
          reactedToMessageId: msg.reaction.message_id,
        };
      }

    case 'button':
      return {
        ...base,
        type: 'button_click',
        buttonText: msg.button?.text ?? '',
        buttonPayload: msg.button?.payload ?? '',
      };

    case 'interactive':
      if (msg.interactive?.type === 'button_reply') {
        return {
          ...base,
          type: 'interactive_reply',
          replyId: msg.interactive.button_reply?.id,
          replyTitle: msg.interactive.button_reply?.title,
        };
      }
      if (msg.interactive?.type === 'list_reply') {
        return {
          ...base,
          type: 'interactive_reply',
          replyId: msg.interactive.list_reply?.id,
          replyTitle: msg.interactive.list_reply?.title,
        };
      }
      return { ...base, type: 'unknown' };

    default:
      // Images, audio, video, documents, etc. — log but skip for now
      console.log(`[WhatsAppParser] Unsupported message type: ${msg.type}`);
      return null;
  }
}

function findContact(
  waId: string,
  contacts?: WhatsAppContact[]
): WhatsAppContact | undefined {
  return contacts?.find((c) => c.wa_id === waId);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Check if a parsed event represents a user interaction that opens a 24-hour messaging window.
 */
export function opensMessagingWindow(event: WhatsAppParsedEvent): boolean {
  return (
    event.type === 'text_message' ||
    event.type === 'reaction_added' ||
    event.type === 'button_click' ||
    event.type === 'interactive_reply'
  );
}

/**
 * Determine the trigger type for window tracking from an event.
 */
export function getWindowTrigger(
  event: WhatsAppParsedEvent
): 'text_reply' | 'reaction' | 'button_click' | 'interactive_reply' {
  switch (event.type) {
    case 'reaction_added':
      return 'reaction';
    case 'button_click':
      return 'button_click';
    case 'interactive_reply':
      return 'interactive_reply';
    default:
      return 'text_reply';
  }
}
