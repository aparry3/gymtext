import { Message } from '@/server/models/conversation';
import { inngest } from '@/server/connections/inngest/client';
import type { RepositoryContainer } from '../../repositories/factory';
import type { ITwilioClient } from '@/server/connections/twilio/factory';
import type { MessageServiceInstance } from './messageService';
import type { UserServiceInstance } from '../user/userService';

/**
 * Represents a message to be queued
 */
export interface QueuedMessage {
  /** Optional text content */
  content?: string;
  /** Optional media URLs for MMS */
  mediaUrls?: string[];
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * MessageQueueServiceInstance interface
 *
 * Defines all public methods available on the message queue service.
 */
export interface MessageQueueServiceInstance {
  enqueueMessages(clientId: string, messages: QueuedMessage[], queueName: string): Promise<void>;
  processNextMessage(clientId: string, queueName: string): Promise<void>;
  sendQueuedMessage(queueEntryId: string): Promise<Message>;
  markMessageDelivered(messageId: string): Promise<void>;
  markMessageFailed(messageId: string, error?: string): Promise<void>;
  checkStalledMessages(): Promise<void>;
  getQueueStatus(clientId: string, queueName: string): Promise<unknown>;
  clearQueue(clientId: string, queueName: string): Promise<void>;
}

export interface MessageQueueServiceDeps {
  message: MessageServiceInstance;
  user: UserServiceInstance;
  twilioClient: ITwilioClient;
}

/**
 * Create a MessageQueueService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @param deps - Service dependencies (message, user, twilioClient)
 * @returns MessageQueueServiceInstance
 */
export function createMessageQueueService(
  repos: RepositoryContainer,
  deps: MessageQueueServiceDeps
): MessageQueueServiceInstance {
  const { message: messageService, user: userService, twilioClient } = deps;

  return {
    async enqueueMessages(
      clientId: string,
      messages: QueuedMessage[],
      queueName: string
    ): Promise<void> {
      if (messages.length === 0) return;

      console.log(`[MessageQueueService] Enqueueing ${messages.length} messages for client ${clientId} in queue '${queueName}'`);

      const queueEntries = messages.map((msg, index) => ({
        clientId,
        queueName,
        sequenceNumber: index + 1,
        messageContent: msg.content || null,
        mediaUrls: msg.mediaUrls ? JSON.stringify(msg.mediaUrls) : null,
        status: 'pending' as const,
      }));

      await repos.messageQueue.createMany(queueEntries);

      console.log(`[MessageQueueService] Created ${queueEntries.length} queue entries`);

      await inngest.send({
        name: 'message-queue/process-next',
        data: { clientId, queueName },
      });
    },

    async processNextMessage(clientId: string, queueName: string): Promise<void> {
      console.log(`[MessageQueueService] Processing next message for client ${clientId} in queue '${queueName}'`);

      const nextEntry = await repos.messageQueue.findNextPending(clientId, queueName);

      if (!nextEntry) {
        console.log(`[MessageQueueService] No more pending messages in queue '${queueName}' for client ${clientId}`);
        await this.clearQueue(clientId, queueName);
        return;
      }

      console.log(`[MessageQueueService] Found next message (sequence ${nextEntry.sequenceNumber})`);

      await inngest.send({
        name: 'message-queue/send-message',
        data: {
          queueEntryId: nextEntry.id,
          clientId: nextEntry.clientId,
          queueName: nextEntry.queueName,
        },
      });
    },

    async sendQueuedMessage(queueEntryId: string): Promise<Message> {
      const queueEntry = await repos.messageQueue.findById(queueEntryId);
      if (!queueEntry) {
        throw new Error(`Queue entry ${queueEntryId} not found`);
      }

      const user = await userService.getUser(queueEntry.clientId);
      if (!user) {
        throw new Error(`Client ${queueEntry.clientId} not found`);
      }

      let mediaUrls: string[] | undefined;
      if (queueEntry.mediaUrls) {
        if (typeof queueEntry.mediaUrls === 'string') {
          try {
            mediaUrls = JSON.parse(queueEntry.mediaUrls);
          } catch (error) {
            console.error('[MessageQueueService] Failed to parse media URLs:', error);
          }
        } else {
          mediaUrls = queueEntry.mediaUrls as string[];
        }
      }

      console.log(`[MessageQueueService] Sending queued message ${queueEntryId}`);
      const message = await messageService.sendMessage(
        user,
        queueEntry.messageContent || undefined,
        mediaUrls
      );

      await repos.messageQueue.linkMessage(queueEntry.id, message.id);

      console.log(`[MessageQueueService] Queued message sent successfully`, {
        queueEntryId,
        messageId: message.id,
      });

      return message;
    },

    async markMessageDelivered(messageId: string): Promise<void> {
      const queueEntry = await repos.messageQueue.findByMessageId(messageId);

      if (!queueEntry) {
        console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
        return;
      }

      console.log(`[MessageQueueService] Marking message ${messageId} as delivered`);

      await repos.messageQueue.updateStatus(queueEntry.id, 'delivered', { deliveredAt: new Date() });

      await inngest.send({
        name: 'message-queue/process-next',
        data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
      });

      console.log(`[MessageQueueService] Triggered next message for queue '${queueEntry.queueName}'`);
    },

    async markMessageFailed(messageId: string, error?: string): Promise<void> {
      const queueEntry = await repos.messageQueue.findByMessageId(messageId);

      if (!queueEntry) {
        console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
        return;
      }

      console.log(`[MessageQueueService] Message ${messageId} failed:`, error);

      if (queueEntry.retryCount < queueEntry.maxRetries) {
        console.log(`[MessageQueueService] Retrying message (attempt ${queueEntry.retryCount + 1}/${queueEntry.maxRetries})`);

        await repos.messageQueue.incrementRetry(queueEntry.id);
        await repos.messageQueue.updateStatus(queueEntry.id, 'pending', undefined, error);

        await inngest.send({
          name: 'message/delivery-failed',
          data: {
            messageId,
            clientId: queueEntry.clientId,
            providerMessageId: messageId,
            error: error || 'Unknown error',
          },
        });
      } else {
        console.log(`[MessageQueueService] Max retries reached, marking as failed and moving to next`);

        await repos.messageQueue.updateStatus(queueEntry.id, 'failed', undefined, error || 'Max retries exceeded');

        await inngest.send({
          name: 'message-queue/process-next',
          data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
        });
      }
    },

    async checkStalledMessages(): Promise<void> {
      const cutoffDate = new Date(Date.now() - 10 * 60 * 1000);
      const stalledEntries = await repos.messageQueue.findStalled(cutoffDate);

      if (stalledEntries.length === 0) {
        console.log('[MessageQueueService] No stalled messages found');
        return;
      }

      console.log(`[MessageQueueService] Found ${stalledEntries.length} stalled messages`);

      for (const entry of stalledEntries) {
        try {
          if (!entry.messageId) {
            console.warn(`[MessageQueueService] Stalled entry ${entry.id} has no messageId, marking as failed`);
            await repos.messageQueue.updateStatus(entry.id, 'failed', undefined, 'No message ID found');
            continue;
          }

          const message = await repos.message.findById(entry.messageId);

          if (!message || !message.providerMessageId) {
            console.warn(`[MessageQueueService] Message ${entry.messageId} not found or has no provider ID`);
            await repos.messageQueue.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
            await this.processNextMessage(entry.clientId, entry.queueName);
            continue;
          }

          console.log(`[MessageQueueService] Checking Twilio status for ${message.providerMessageId}`);
          const twilioMessage = await twilioClient.getMessageStatus(message.providerMessageId);

          if (twilioMessage.status === 'delivered') {
            console.log(`[MessageQueueService] Twilio confirms delivery, updating queue`);
            await this.markMessageDelivered(entry.messageId);
          } else if (twilioMessage.status === 'failed' || twilioMessage.status === 'undelivered') {
            console.log(`[MessageQueueService] Twilio confirms failure, updating queue`);
            await this.markMessageFailed(entry.messageId, `Stalled message status: ${twilioMessage.status}`);
          } else {
            console.log(`[MessageQueueService] Message still in transit (${twilioMessage.status}), assuming delivered`);
            await repos.messageQueue.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
            await this.processNextMessage(entry.clientId, entry.queueName);
          }
        } catch (error) {
          console.error(`[MessageQueueService] Error checking stalled message ${entry.id}:`, error);
          await repos.messageQueue.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
          await this.processNextMessage(entry.clientId, entry.queueName);
        }
      }
    },

    async getQueueStatus(clientId: string, queueName: string) {
      return await repos.messageQueue.getQueueStatus(clientId, queueName);
    },

    async clearQueue(clientId: string, queueName: string): Promise<void> {
      console.log(`[MessageQueueService] Clearing completed queue '${queueName}' for client ${clientId}`);
      await repos.messageQueue.deleteCompleted(clientId, queueName);
    },
  };
}

// =============================================================================
