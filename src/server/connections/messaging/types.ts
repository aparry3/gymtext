/**
 * Messaging Client Types
 *
 * Defines the interface and types for multi-provider messaging support.
 * Supports Twilio, local development clients, and future messaging providers.
 */

export type MessagingProvider = 'twilio' | 'local' | 'websocket';

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
   * Send a message to a recipient
   * @param to - Recipient phone number or identifier
   * @param message - Message content to send
   * @returns Promise resolving to message result with delivery status
   */
  sendMessage(to: string, message: string): Promise<MessageResult>;
}
