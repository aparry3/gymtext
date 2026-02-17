import { UserWithProfile } from '../../../models/user';
import { Message, MessageDeliveryStatus } from '../../../models/message';
import { inngest } from '../../../connections/inngest/client';
import { getTwilioSecrets } from '@/server/config';
import type { RepositoryContainer } from '../../../repositories/factory';
import type { UserServiceInstance } from '../user/userService';
import type { Json } from '../../../models/_types';

/**
 * Parameters for storing an inbound message
 */
export interface StoreInboundMessageParams {
  clientId: string;
  from: string;
  to: string;
  content: string;
  twilioData?: Record<string, unknown>;
}

/**
 * Parameters for storing an outbound message
 */
export interface StoreOutboundMessageParams {
  clientId: string;
  to: string;
  content: string;
  from?: string;
  provider?: 'twilio' | 'whatsapp' | 'local' | 'websocket';
  providerMessageId?: string;
  metadata?: Record<string, unknown>;
  deliveryStatus?: MessageDeliveryStatus;
}

/**
 * Parameters for ingesting an inbound message (async path)
 */
export interface IngestMessageParams {
  user: UserWithProfile;
  content: string;
  from: string;
  to: string;
  twilioData?: Record<string, unknown>;
}

/**
 * Result of ingesting an inbound message
 */
export interface IngestMessageResult {
  jobId?: string;
  ackMessage: string;
  action: 'resendWorkout' | 'fullChatAgent' | null;
  reasoning: string;
}

/**
 * MessageServiceInstance interface
 *
 * Domain service for message storage and retrieval.
 * Does NOT handle sending - that's the MessagingOrchestrator's job.
 */
export interface MessageServiceInstance {
  storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null>;
  storeOutboundMessage(params: StoreOutboundMessageParams): Promise<Message | null>;
  getMessages(clientId: string, limit?: number, offset?: number): Promise<Message[]>;
  getRecentMessages(clientId: string, limit?: number): Promise<Message[]>;
  getMessageById(messageId: string): Promise<Message | undefined>;
  getMessagesByIds(messageIds: string[]): Promise<Message[]>;
  splitMessages(messages: Message[], contextMinutes: number): { pending: Message[]; context: Message[] };
  getPendingMessages(clientId: string): Promise<Message[]>;
  ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult>;
  updateDeliveryStatus(
    messageId: string,
    status: MessageDeliveryStatus,
    error?: string
  ): Promise<Message>;
  updateProviderMessageId(messageId: string, providerMessageId: string): Promise<Message>;
  markCancelled(messageId: string): Promise<Message>;
  findStuckMessages(cutoffDate: Date, limit?: number): Promise<Message[]>;
}

/**
 * Dependencies for MessageService
 */
export interface MessageServiceDeps {
  user: UserServiceInstance;
}

/**
 * Create a MessageService instance with injected dependencies
 *
 * This is a domain service focused on message storage and retrieval.
 * It does NOT handle message sending - that responsibility belongs
 * to the MessagingOrchestrator service.
 */
export function createMessageService(
  repos: RepositoryContainer,
  deps: MessageServiceDeps
): MessageServiceInstance {
  const instance: MessageServiceInstance = {
    async storeInboundMessage(params: StoreInboundMessageParams): Promise<Message | null> {
      const { clientId, from, to, content, twilioData } = params;

      const message = await repos.message.create({
        clientId: clientId,
        direction: 'inbound',
        content,
        phoneFrom: from,
        phoneTo: to,
        provider: 'twilio',
        providerMessageId: (twilioData?.MessageSid as string) || null,
        metadata: (twilioData || {}) as Json,
      });

      return message;
    },

    async storeOutboundMessage(params: StoreOutboundMessageParams): Promise<Message | null> {
      const {
        clientId,
        to,
        content,
        from = getTwilioSecrets().phoneNumber,
        provider = 'twilio',
        providerMessageId,
        metadata,
        deliveryStatus = 'queued',
      } = params;

      const user = await deps.user.getUser(clientId);
      if (!user) {
        return null;
      }

      const message = await repos.message.create({
        clientId: clientId,
        direction: 'outbound',
        content,
        phoneFrom: from,
        phoneTo: to,
        provider,
        providerMessageId: providerMessageId || null,
        metadata: (metadata || {}) as Json,
        deliveryStatus,
        deliveryAttempts: deliveryStatus === 'queued' ? 0 : 1,
        lastDeliveryAttemptAt: deliveryStatus === 'queued' ? null : new Date(),
      });

      return message;
    },

    async getMessages(clientId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
      return await repos.message.findByClientId(clientId, limit, offset);
    },

    async getRecentMessages(clientId: string, limit: number = 10): Promise<Message[]> {
      return await repos.message.findRecentByClientId(clientId, limit);
    },

    async getMessageById(messageId: string): Promise<Message | undefined> {
      return await repos.message.findById(messageId);
    },

    async getMessagesByIds(messageIds: string[]): Promise<Message[]> {
      return await repos.message.findByIds(messageIds);
    },

    splitMessages(messages: Message[], contextMinutes: number): { pending: Message[]; context: Message[] } {
      const cutoffTime = new Date(Date.now() - contextMinutes * 60 * 1000);

      let lastOutboundIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].direction === 'outbound') {
          lastOutboundIndex = i;
          break;
        }
      }

      const pending =
        lastOutboundIndex >= 0
          ? messages.slice(lastOutboundIndex + 1)
          : messages.filter((m) => m.direction === 'inbound');

      const allContext = lastOutboundIndex >= 0 ? messages.slice(0, lastOutboundIndex + 1) : [];
      const context = allContext.filter((m) => new Date(m.createdAt) >= cutoffTime);

      return { pending, context };
    },

    async getPendingMessages(clientId: string): Promise<Message[]> {
      const recentMessages = await this.getRecentMessages(clientId, 20);

      const pendingMessages: Message[] = [];

      for (let i = recentMessages.length - 1; i >= 0; i--) {
        const message = recentMessages[i];

        if (message.direction === 'outbound') {
          break;
        }

        if (message.direction === 'inbound') {
          pendingMessages.unshift(message);
        }
      }

      return pendingMessages;
    },

    async ingestMessage(params: IngestMessageParams): Promise<IngestMessageResult> {
      const { user, content, from, to, twilioData } = params;

      const storedMessage = await this.storeInboundMessage({
        clientId: user.id,
        from,
        to,
        content,
        twilioData,
      });

      if (!storedMessage) {
        throw new Error('Failed to store inbound message');
      }

      const { ids } = await inngest.send({
        name: 'message/received',
        data: {
          userId: user.id,
          content,
          from,
          to,
        },
      });
      const jobId = ids[0];

      console.log('[MessageService] Message stored and queued:', {
        userId: user.id,
        messageId: storedMessage.id,
        jobId,
      });

      return {
        jobId,
        ackMessage: '',
        action: 'fullChatAgent',
        reasoning: 'Queued for processing',
      };
    },

    async updateDeliveryStatus(
      messageId: string,
      status: MessageDeliveryStatus,
      error?: string
    ): Promise<Message> {
      return await repos.message.updateDeliveryStatus(messageId, status, error);
    },

    async updateProviderMessageId(messageId: string, providerMessageId: string): Promise<Message> {
      return await repos.message.updateProviderMessageId(messageId, providerMessageId);
    },

    async markCancelled(messageId: string): Promise<Message> {
      return await repos.message.markCancelled(messageId);
    },

    async findStuckMessages(cutoffDate: Date, limit: number = 100): Promise<Message[]> {
      return await repos.message.findStuckMessages(cutoffDate, limit);
    },
  };

  return instance;
}

// =============================================================================
