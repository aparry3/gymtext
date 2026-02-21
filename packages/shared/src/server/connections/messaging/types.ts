/**
 * Messaging Client Types
 *
 * Defines the interface and types for multi-provider messaging support.
 * Supports Twilio, local development clients, and future messaging providers.
 */

import type { UserWithProfile } from '@/server/models/user';

/**
 * Messaging provider identifiers
 */
export enum MessageProvider {
  TWILIO = 'twilio',
  WHATSAPP = 'whatsapp',
  LOCAL = 'local',
  WEBSOCKET = 'websocket',
}

export type MessagingProvider = 'twilio' | 'whatsapp' | 'local' | 'websocket';

export interface MessageResult {
  /** Unique identifier for the message from the provider */
  messageId: string;

  /** Status of the message delivery */
  status: 'sent' | 'queued' | 'failed' | 'delivered';

  /** The messaging provider that sent the message */
  provider: MessagingProvider;

  /** Phone number or identifier the message was sent to */
  to: string;

  /** Phone number or identifier the message was sent from */
  from: string;

  /** Timestamp when the message was sent */
  timestamp: Date;

  /** Provider-specific metadata (e.g., Twilio MessageInstance, local event data) */
  metadata?: Record<string, unknown>;
}

export interface IMessagingClient {
  /** The provider name for this client */
  readonly provider: MessagingProvider;

  /**
   * Send a message to a user
   * @param user - User object containing phone number and other properties
   * @param message - Optional message content to send (can be undefined for MMS-only messages)
   * @param mediaUrls - Optional array of media URLs for MMS (images, videos, etc.)
   * @param templateSid - Optional WhatsApp template SID for business-initiated messages
   * @param templateVariables - Optional variables for template substitution
   * @returns Promise resolving to message result with delivery status
   */
  sendMessage(
    user: UserWithProfile,
    message?: string,
    mediaUrls?: string[],
    templateSid?: string,
    templateVariables?: Record<string, string>
  ): Promise<MessageResult>;
}
