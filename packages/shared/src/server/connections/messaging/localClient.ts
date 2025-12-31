/**
 * Local Messaging Client
 *
 * Implements IMessagingClient for local development and testing.
 * Uses EventEmitter to broadcast messages to connected SSE clients.
 * Does not actually send SMS - instead emits events for local consumption.
 */

import { EventEmitter } from 'events';
import type { IMessagingClient, MessageResult, MessagingProvider } from './types';
import type { UserWithProfile } from '@/server/models/user';

export interface LocalMessage {
  messageId: string;
  to: string;
  from: string;
  content: string;
  timestamp: Date;
}

export class LocalMessagingClient implements IMessagingClient {
  public readonly provider: MessagingProvider = 'local';
  private eventEmitter: EventEmitter;
  private messageCounter = 0;

  constructor() {
    this.eventEmitter = new EventEmitter();
    // Increase max listeners for SSE connections
    this.eventEmitter.setMaxListeners(100);
  }

  async sendMessage(user: UserWithProfile, message?: string, mediaUrls?: string[]): Promise<MessageResult> {
    const messageId = `local-${Date.now()}-${++this.messageCounter}`;
    const timestamp = new Date();
    const to = user.phoneNumber;

    const localMessage: LocalMessage = {
      messageId,
      to,
      from: 'local-system',
      content: message || '[MMS only - no text]',
      timestamp,
    };

    // Emit the message event for SSE listeners
    this.eventEmitter.emit('message', localMessage);

    console.log(`[LocalMessagingClient] Message sent (not actual SMS):`, {
      messageId,
      to,
      userId: user.id,
      preview: message ? message.substring(0, 50) : '[MMS only]',
      mediaUrls,
    });

    return {
      messageId,
      status: 'sent',
      provider: this.provider,
      to,
      from: 'local-system',
      timestamp,
      metadata: {
        userId: user.id,
        phoneNumber: to,
        contentLength: message?.length || 0,
        mediaUrls,
      },
    };
  }

  /**
   * Subscribe to message events (for SSE connections)
   */
  onMessage(listener: (message: LocalMessage) => void): void {
    this.eventEmitter.on('message', listener);
  }

  /**
   * Unsubscribe from message events
   */
  offMessage(listener: (message: LocalMessage) => void): void {
    this.eventEmitter.off('message', listener);
  }

  /**
   * Get current number of active listeners
   */
  getListenerCount(): number {
    return this.eventEmitter.listenerCount('message');
  }
}

// Export singleton instance
export const localMessagingClient = new LocalMessagingClient();
