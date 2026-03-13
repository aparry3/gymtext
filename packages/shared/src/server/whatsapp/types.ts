/**
 * WhatsApp Webhook Types
 *
 * Type definitions for all incoming webhook payloads from the WhatsApp Business Cloud API.
 *
 * @see https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/components
 */

// ---------------------------------------------------------------------------
// Top-level webhook envelope
// ---------------------------------------------------------------------------

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: WhatsAppWebhookEntry[];
}

export interface WhatsAppWebhookEntry {
  id: string;
  changes: WhatsAppWebhookChange[];
}

export interface WhatsAppWebhookChange {
  value: WhatsAppWebhookValue;
  field: 'messages';
}

export interface WhatsAppWebhookValue {
  messaging_product: 'whatsapp';
  metadata: WhatsAppMetadata;
  contacts?: WhatsAppContact[];
  messages?: WhatsAppInboundMessage[];
  statuses?: WhatsAppStatusUpdate[];
}

export interface WhatsAppMetadata {
  display_phone_number: string;
  phone_number_id: string;
}

export interface WhatsAppContact {
  profile: { name: string };
  wa_id: string;
}

// ---------------------------------------------------------------------------
// Inbound message types
// ---------------------------------------------------------------------------

export type WhatsAppMessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'document'
  | 'location'
  | 'contacts'
  | 'sticker'
  | 'reaction'
  | 'button'
  | 'interactive'
  | 'order'
  | 'system'
  | 'unknown';

export interface WhatsAppInboundMessage {
  from: string;
  id: string;
  timestamp: string;
  type: WhatsAppMessageType;

  // Text message
  text?: { body: string };

  // Reaction to a message
  reaction?: WhatsAppReaction;

  // Template button click
  button?: { text: string; payload: string };

  // Interactive message reply (quick reply or list)
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };

  // Contextual info (which message this is replying to / reacting to)
  context?: {
    from: string;
    id: string;
    referred_product?: { catalog_id: string; product_retailer_id: string };
  };
}

export interface WhatsAppReaction {
  /** WhatsApp message ID of the message being reacted to */
  message_id: string;
  /** Emoji used — absent when reaction is removed */
  emoji?: string;
}

// ---------------------------------------------------------------------------
// Status updates
// ---------------------------------------------------------------------------

export type WhatsAppStatusValue = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppStatusUpdate {
  id: string;
  status: WhatsAppStatusValue;
  timestamp: string;
  recipient_id: string;
  conversation?: {
    id: string;
    origin: { type: string };
    expiration_timestamp?: string;
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
  };
  errors?: Array<{
    code: number;
    title: string;
    message?: string;
    error_data?: { details: string };
  }>;
}

// ---------------------------------------------------------------------------
// Processed event types (internal, after webhook parsing)
// ---------------------------------------------------------------------------

export type WhatsAppEventType =
  | 'text_message'
  | 'reaction_added'
  | 'reaction_removed'
  | 'button_click'
  | 'interactive_reply'
  | 'status_update'
  | 'unknown';

export interface WhatsAppParsedEvent {
  type: WhatsAppEventType;
  from: string;
  messageId: string;
  timestamp: Date;
  contactName?: string;

  // For text messages
  text?: string;

  // For reactions
  reactedToMessageId?: string;
  emoji?: string;

  // For button clicks
  buttonText?: string;
  buttonPayload?: string;

  // For interactive replies
  replyId?: string;
  replyTitle?: string;
}

// ---------------------------------------------------------------------------
// 24-hour messaging window tracking
// ---------------------------------------------------------------------------

export interface MessagingWindow {
  userId: string;
  phone: string;
  /** When the window opened (user last interacted) */
  openedAt: Date;
  /** When the window expires (24h after openedAt) */
  expiresAt: Date;
  /** What opened the window */
  trigger: 'text_reply' | 'reaction' | 'button_click' | 'interactive_reply';
}
