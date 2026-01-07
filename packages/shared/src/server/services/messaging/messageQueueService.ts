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
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { MessageQueueRepository } from '@/server/repositories/messageQueueRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { twilioClient as defaultTwilioClient } from '@/server/connections/twilio/twilio';

/**
 * @deprecated Use createMessageQueueService(repos, deps) instead
 */
export class MessageQueueService {
  private static instance: MessageQueueService;
  private messageQueueRepo: MessageQueueRepository;

  private constructor() {
    this.messageQueueRepo = new MessageQueueRepository(postgresDb);
  }

  public static getInstance(): MessageQueueService {
    if (!MessageQueueService.instance) {
      MessageQueueService.instance = new MessageQueueService();
    }
    return MessageQueueService.instance;
  }

  /**
   * Enqueue multiple messages for ordered delivery
   *
   * Creates queue entries and immediately starts sending the first message.
   * Subsequent messages will be sent after previous ones are delivered.
   *
   * @param clientId - Client to send messages to
   * @param messages - Array of messages to queue
   * @param queueName - Named queue (e.g., 'daily', 'onboarding')
   * @returns Array of created queue entries
   */
  async enqueueMessages(
    clientId: string,
    messages: QueuedMessage[],
    queueName: string
  ): Promise<void> {
    if (messages.length === 0) return;

    console.log(`[MessageQueueService] Enqueueing ${messages.length} messages for client ${clientId} in queue '${queueName}'`);

    // Create queue entries with sequence numbers
    const queueEntries = messages.map((msg, index) => ({
      clientId,
      queueName,
      sequenceNumber: index + 1,
      messageContent: msg.content || null,
      // Stringify array for JSONB storage (Kysely will handle the JSONB insert)
      mediaUrls: msg.mediaUrls ? JSON.stringify(msg.mediaUrls) : null,
      status: 'pending' as const,
    }));

    // Bulk insert all queue entries
    await this.messageQueueRepo.createMany(queueEntries);

    console.log(`[MessageQueueService] Created ${queueEntries.length} queue entries`);

    // Trigger processing of the first message via Inngest
    await inngest.send({
      name: 'message-queue/process-next',
      data: {
        clientId,
        queueName,
      },
    });
  }

  /**
   * Process the next pending message in a queue
   *
   * Sends the next message via MessageService and updates queue status.
   * Called by Inngest when the previous message is delivered.
   *
   * @param clientId - Client ID
   * @param queueName - Queue name
   */
  async processNextMessage(clientId: string, queueName: string): Promise<void> {
    console.log(`[MessageQueueService] Processing next message for client ${clientId} in queue '${queueName}'`);

    // Get next pending message
    const nextEntry = await this.messageQueueRepo.findNextPending(clientId, queueName);

    if (!nextEntry) {
      console.log(`[MessageQueueService] No more pending messages in queue '${queueName}' for client ${clientId}`);
      // Optionally clean up completed queue
      await this.clearQueue(clientId, queueName);
      return;
    }

    console.log(`[MessageQueueService] Found next message (sequence ${nextEntry.sequenceNumber})`);

    // Send via Inngest to handle actual message sending
    await inngest.send({
      name: 'message-queue/send-message',
      data: {
        queueEntryId: nextEntry.id,
        clientId: nextEntry.clientId,
        queueName: nextEntry.queueName,
      },
    });
  }

  /**
   * Send a queued message
   * Called by Inngest function to actually send the message
   */
  async sendQueuedMessage(queueEntryId: string): Promise<Message> {
    const queueEntry = await this.messageQueueRepo.findById(queueEntryId);
    if (!queueEntry) {
      throw new Error(`Queue entry ${queueEntryId} not found`);
    }

    // Import MessageService here to avoid circular dependency
    const { messageService } = await import('./messageService');
    const { userService } = await import('../user/userService');

    const user = await userService.getUser(queueEntry.clientId);
    if (!user) {
      throw new Error(`Client ${queueEntry.clientId} not found`);
    }

    // Get media URLs if present
    // Handle both stringified JSON and already-parsed arrays
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

    // Send the message
    console.log(`[MessageQueueService] Sending queued message ${queueEntryId}`);
    const message = await messageService.sendMessage(
      user,
      queueEntry.messageContent || undefined,
      mediaUrls
    );

    // Link the queue entry to the sent message
    await this.messageQueueRepo.linkMessage(queueEntry.id, message.id);

    console.log(`[MessageQueueService] Queued message sent successfully`, {
      queueEntryId,
      messageId: message.id,
    });

    return message;
  }

  /**
   * Mark a message as delivered and trigger next message
   *
   * Called by Twilio webhook when message status is 'delivered'.
   * Updates queue entry and triggers next message in queue.
   *
   * @param messageId - ID of the delivered message
   */
  async markMessageDelivered(messageId: string): Promise<void> {
    const queueEntry = await this.messageQueueRepo.findByMessageId(messageId);

    if (!queueEntry) {
      console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
      return;
    }

    console.log(`[MessageQueueService] Marking message ${messageId} as delivered`);

    // Update status to delivered
    await this.messageQueueRepo.updateStatus(
      queueEntry.id,
      'delivered',
      { deliveredAt: new Date() }
    );

    // Trigger next message in queue via Inngest
    await inngest.send({
      name: 'message-queue/process-next',
      data: {
        clientId: queueEntry.clientId,
        queueName: queueEntry.queueName,
      },
    });

    console.log(`[MessageQueueService] Triggered next message for queue '${queueEntry.queueName}'`);
  }

  /**
   * Mark a message as failed and optionally retry or move to next
   *
   * Called by Twilio webhook when message status is 'failed' or 'undelivered'.
   * Retries if under max retries, otherwise marks failed and moves to next.
   *
   * @param messageId - ID of the failed message
   * @param error - Error message from Twilio
   */
  async markMessageFailed(messageId: string, error?: string): Promise<void> {
    const queueEntry = await this.messageQueueRepo.findByMessageId(messageId);

    if (!queueEntry) {
      console.log(`[MessageQueueService] No queue entry found for message ${messageId}`);
      return;
    }

    console.log(`[MessageQueueService] Message ${messageId} failed:`, error);

    // Check if we should retry
    if (queueEntry.retryCount < queueEntry.maxRetries) {
      console.log(`[MessageQueueService] Retrying message (attempt ${queueEntry.retryCount + 1}/${queueEntry.maxRetries})`);

      // Increment retry count
      await this.messageQueueRepo.incrementRetry(queueEntry.id);

      // Reset to pending for retry
      await this.messageQueueRepo.updateStatus(
        queueEntry.id,
        'pending',
        undefined,
        error
      );

      // Trigger retry via existing message retry mechanism
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

      // Mark as permanently failed
      await this.messageQueueRepo.updateStatus(
        queueEntry.id,
        'failed',
        undefined,
        error || 'Max retries exceeded'
      );

      // Move to next message
      await inngest.send({
        name: 'message-queue/process-next',
        data: {
          clientId: queueEntry.clientId,
          queueName: queueEntry.queueName,
        },
      });
    }
  }

  /**
   * Check for stalled messages and unblock queues
   *
   * Finds messages that have been in 'sent' status for longer than
   * their timeout period. Verifies actual status with Twilio API.
   *
   * Called by scheduled Inngest cron job.
   */
  async checkStalledMessages(): Promise<void> {
    // Find messages sent more than 10 minutes ago
    const cutoffDate = new Date(Date.now() - 10 * 60 * 1000);
    const stalledEntries = await this.messageQueueRepo.findStalled(cutoffDate);

    if (stalledEntries.length === 0) {
      console.log('[MessageQueueService] No stalled messages found');
      return;
    }

    console.log(`[MessageQueueService] Found ${stalledEntries.length} stalled messages`);

    for (const entry of stalledEntries) {
      try {
        if (!entry.messageId) {
          console.warn(`[MessageQueueService] Stalled entry ${entry.id} has no messageId, marking as failed`);
          await this.messageQueueRepo.updateStatus(entry.id, 'failed', undefined, 'No message ID found');
          continue;
        }

        // Get the actual message to find provider message ID
        const { messageService } = await import('./messageService');
        const messageRepo = messageService['messageRepo'];
        const message = await messageRepo.findById(entry.messageId);

        if (!message || !message.providerMessageId) {
          console.warn(`[MessageQueueService] Message ${entry.messageId} not found or has no provider ID`);
          // Assume delivered to avoid blocking queue
          await this.messageQueueRepo.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
          await this.processNextMessage(entry.clientId, entry.queueName);
          continue;
        }

        // Check actual status via Twilio API
        console.log(`[MessageQueueService] Checking Twilio status for ${message.providerMessageId}`);
        const twilioMessage = await defaultTwilioClient.getMessageStatus(message.providerMessageId);

        if (twilioMessage.status === 'delivered') {
          console.log(`[MessageQueueService] Twilio confirms delivery, updating queue`);
          await this.markMessageDelivered(entry.messageId);
        } else if (twilioMessage.status === 'failed' || twilioMessage.status === 'undelivered') {
          console.log(`[MessageQueueService] Twilio confirms failure, updating queue`);
          await this.markMessageFailed(entry.messageId, `Stalled message status: ${twilioMessage.status}`);
        } else {
          // Still in transit, assume delivered to avoid blocking indefinitely
          console.log(`[MessageQueueService] Message still in transit (${twilioMessage.status}), assuming delivered`);
          await this.messageQueueRepo.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
          await this.processNextMessage(entry.clientId, entry.queueName);
        }
      } catch (error) {
        console.error(`[MessageQueueService] Error checking stalled message ${entry.id}:`, error);
        // Assume delivered to avoid blocking queue indefinitely
        await this.messageQueueRepo.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
        await this.processNextMessage(entry.clientId, entry.queueName);
      }
    }
  }

  /**
   * Get queue status for a client
   */
  async getQueueStatus(clientId: string, queueName: string) {
    return await this.messageQueueRepo.getQueueStatus(clientId, queueName);
  }

  /**
   * Clear completed/failed queue entries
   */
  async clearQueue(clientId: string, queueName: string): Promise<void> {
    console.log(`[MessageQueueService] Clearing completed queue '${queueName}' for client ${clientId}`);
    await this.messageQueueRepo.deleteCompleted(clientId, queueName);
  }
}

// Export singleton instance
export const messageQueueService = MessageQueueService.getInstance();
