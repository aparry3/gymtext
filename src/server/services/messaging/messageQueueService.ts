import { MessageQueueRepository } from '@/server/repositories/messageQueueRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { Message } from '@/server/models/conversation';
import { inngest } from '@/server/connections/inngest/client';
import { twilioClient } from '@/server/connections/twilio/twilio';

/**
 * Represents a message to be queued
 */
export interface QueuedMessage {
  /** Optional text content */
  content?: string;
  /** Optional media URLs for MMS */
  mediaUrls?: string[];
}

/**
 * MessageQueueService
 *
 * Manages ordered message delivery for users. Ensures messages are sent
 * sequentially and only after the previous message has been delivered.
 *
 * Key Features:
 * - Per-user, per-queue message ordering
 * - Waits for Twilio delivery webhooks before sending next message
 * - Automatic retry on failure (up to max retries)
 * - Timeout detection and recovery for stalled messages
 *
 * Usage:
 * 1. Enqueue messages: enqueueMessages(userId, messages, queueName)
 * 2. Webhook triggers delivery confirmation: markMessageDelivered(messageId)
 * 3. Service automatically sends next message in queue
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
   * @param userId - User to send messages to
   * @param messages - Array of messages to queue
   * @param queueName - Named queue (e.g., 'daily', 'onboarding')
   * @returns Array of created queue entries
   */
  async enqueueMessages(
    userId: string,
    messages: QueuedMessage[],
    queueName: string
  ): Promise<void> {
    if (messages.length === 0) return;

    console.log(`[MessageQueueService] Enqueueing ${messages.length} messages for user ${userId} in queue '${queueName}'`);

    // Create queue entries with sequence numbers
    const queueEntries = messages.map((msg, index) => ({
      userId,
      queueName,
      sequenceNumber: index + 1,
      messageContent: msg.content || null,
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
        userId,
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
   * @param userId - User ID
   * @param queueName - Queue name
   */
  async processNextMessage(userId: string, queueName: string): Promise<void> {
    console.log(`[MessageQueueService] Processing next message for user ${userId} in queue '${queueName}'`);

    // Get next pending message
    const nextEntry = await this.messageQueueRepo.findNextPending(userId, queueName);

    if (!nextEntry) {
      console.log(`[MessageQueueService] No more pending messages in queue '${queueName}' for user ${userId}`);
      // Optionally clean up completed queue
      await this.clearQueue(userId, queueName);
      return;
    }

    console.log(`[MessageQueueService] Found next message (sequence ${nextEntry.sequenceNumber})`);

    // Send via Inngest to handle actual message sending
    await inngest.send({
      name: 'message-queue/send-message',
      data: {
        queueEntryId: nextEntry.id,
        userId: nextEntry.userId,
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

    const user = await userService.getUser(queueEntry.userId);
    if (!user) {
      throw new Error(`User ${queueEntry.userId} not found`);
    }

    // Parse media URLs if present
    let mediaUrls: string[] | undefined;
    if (queueEntry.mediaUrls) {
      try {
        mediaUrls = JSON.parse(queueEntry.mediaUrls as string);
      } catch (error) {
        console.error('[MessageQueueService] Failed to parse media URLs:', error);
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
        userId: queueEntry.userId,
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
          userId: queueEntry.userId,
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
          userId: queueEntry.userId,
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
          await this.processNextMessage(entry.userId, entry.queueName);
          continue;
        }

        // Check actual status via Twilio API
        console.log(`[MessageQueueService] Checking Twilio status for ${message.providerMessageId}`);
        const twilioMessage = await twilioClient.getMessageStatus(message.providerMessageId);

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
          await this.processNextMessage(entry.userId, entry.queueName);
        }
      } catch (error) {
        console.error(`[MessageQueueService] Error checking stalled message ${entry.id}:`, error);
        // Assume delivered to avoid blocking queue indefinitely
        await this.messageQueueRepo.updateStatus(entry.id, 'delivered', { deliveredAt: new Date() });
        await this.processNextMessage(entry.userId, entry.queueName);
      }
    }
  }

  /**
   * Get queue status for a user
   */
  async getQueueStatus(userId: string, queueName: string) {
    return await this.messageQueueRepo.getQueueStatus(userId, queueName);
  }

  /**
   * Clear completed/failed queue entries
   */
  async clearQueue(userId: string, queueName: string): Promise<void> {
    console.log(`[MessageQueueService] Clearing completed queue '${queueName}' for user ${userId}`);
    await this.messageQueueRepo.deleteCompleted(userId, queueName);
  }
}

// Export singleton instance
export const messageQueueService = MessageQueueService.getInstance();
