import { UserWithProfile } from '../../models/user';
import { Message, MessageDeliveryStatus } from '../../models/message';
import { inngest } from '../../connections/inngest/client';
import { messagingClient, getMessagingClientByProvider } from '../../connections/messaging';
import { isMessageTooLong, getSmsMaxLength } from '../../utils/smsValidation';
import { isNonRetryableError, isUnsubscribedError } from '../../utils/twilioErrors';
import type { MessageServiceInstance } from '../domain/messaging/messageService';
import type { QueueServiceInstance } from '../domain/messaging/queueService';
import type { UserServiceInstance } from '../domain/user/userService';
import type { SubscriptionServiceInstance } from '../domain/subscription/subscriptionService';
import type { ITwilioClient } from '../../connections/twilio/factory';

/**
 * Message content to be queued
 */
export interface QueuedMessageContent {
  content?: string;
  mediaUrls?: string[];
  templateSid?: string;
  templateVariables?: Record<string, string>;
}

/**
 * Result of sending a message
 */
export interface SendResult {
  success: boolean;
  messageId?: string;
  providerMessageId?: string;
  error?: string;
}

/**
 * MessagingOrchestratorInstance interface
 *
 * High-level orchestration service for message queuing and sending.
 * Coordinates between MessageService (storage), QueueService (ordering),
 * and Twilio (delivery).
 *
 * Key Principle: Messages are stored FIRST, then enqueued.
 * Queue entries only reference message IDs, never store content.
 */
export interface MessagingOrchestratorInstance {
  /**
   * Queue a single message for sending
   * Stores the message first, then enqueues it
   */
  queueMessage(
    user: UserWithProfile,
    content: QueuedMessageContent,
    queueName: string,
    provider?: 'twilio' | 'whatsapp'
  ): Promise<{ messageId: string; queueEntryId: string }>;

  /**
   * Queue multiple messages for sending in sequence
   * Stores all messages first, then enqueues them
   */
  queueMessages(
    user: UserWithProfile,
    messages: QueuedMessageContent[],
    queueName: string,
    provider?: 'twilio' | 'whatsapp'
  ): Promise<{ messageIds: string[]; queueEntryIds: string[] }>;

  /**
   * Send a message immediately without queuing
   * Used for direct chat responses where ordering doesn't matter
   */
  sendImmediate(
    user: UserWithProfile,
    content: string,
    mediaUrls?: string[],
    provider?: 'twilio' | 'whatsapp'
  ): Promise<SendResult>;

  /**
   * Process the next pending message in a queue
   * Called by Inngest when a queue needs to advance
   */
  processNext(clientId: string, queueName: string): Promise<void>;

  /**
   * Send a specific queued message
   * Called by Inngest for individual message sends
   */
  sendQueuedMessage(queueEntryId: string): Promise<SendResult>;

  /**
   * Handle delivery confirmation from Twilio webhook
   */
  handleDeliveryConfirmation(providerMessageId: string): Promise<void>;

  /**
   * Handle delivery failure from Twilio webhook
   */
  handleDeliveryFailure(providerMessageId: string, error?: string): Promise<void>;

  /**
   * Check for stalled messages and update their status
   */
  checkStalledMessages(): Promise<void>;

  /**
   * Clean up messages stuck in 'queued' or 'sent' status
   * Queries Twilio for actual status and updates accordingly
   */
  cleanupStuckMessages(): Promise<{ cleaned: number; delivered: number; failed: number; cancelled: number }>;

  /**
   * Cancel all pending messages for a client
   */
  cancelAllPendingMessages(clientId: string): Promise<number>;

  /**
   * Cancel a specific queue entry
   */
  cancelQueueEntry(queueEntryId: string): Promise<{ success: boolean; error?: string }>;

  /**
   * Get queue status for a client
   */
  getQueueStatus(clientId: string, queueName: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }>;

  /**
   * Clear completed queue entries
   */
  clearQueue(clientId: string, queueName: string): Promise<void>;
}

/**
 * Dependencies for MessagingOrchestrator
 */
export interface MessagingOrchestratorDeps {
  message: MessageServiceInstance;
  queue: QueueServiceInstance;
  user: UserServiceInstance;
  subscription: SubscriptionServiceInstance;
  twilioClient: ITwilioClient;
}

/**
 * Create a MessagingOrchestrator instance
 *
 * This orchestration service coordinates the message-first flow:
 * 1. Store message in messages table
 * 2. Create queue entry referencing the message
 * 3. Trigger Inngest for async processing
 * 4. Send via Twilio when processed
 * 5. Update status based on webhook callbacks
 */
export function createMessagingOrchestrator(
  deps: MessagingOrchestratorDeps
): MessagingOrchestratorInstance {
  const {
    message: messageService,
    queue: queueService,
    user: userService,
    subscription: subscriptionService,
    twilioClient,
  } = deps;

  /**
   * Internal helper to handle unsubscribed user (21610 error)
   */
  const handleUnsubscribedUser = async (clientId: string): Promise<void> => {
    console.log(`[MessagingOrchestrator] User unsubscribed (21610), canceling subscription:`, clientId);

    try {
      await subscriptionService.immediatelyCancelSubscription(clientId);
      console.log(`[MessagingOrchestrator] Subscription canceled for unsubscribed user:`, clientId);
    } catch (cancelError) {
      console.error(`[MessagingOrchestrator] Failed to cancel subscription:`, cancelError);
    }

    // Cancel all pending messages for this user
    const cancelledCount = await queueService.cancelAllForClient(clientId);
    console.log(`[MessagingOrchestrator] Cancelled ${cancelledCount} pending messages for unsubscribed user`);
  };

  return {
    async queueMessage(
      user: UserWithProfile,
      content: QueuedMessageContent,
      queueName: string,
      provider?: 'twilio' | 'whatsapp'
    ): Promise<{ messageId: string; queueEntryId: string }> {
      // Determine messaging provider (only twilio or whatsapp for actual messaging)
      const messageProvider: 'twilio' | 'whatsapp' = provider || 
        (user.preferredMessagingProvider === 'whatsapp' ? 'whatsapp' : 'twilio');
      
      // Validate message length
      const maxLength = getSmsMaxLength();
      if (content.content && isMessageTooLong(content.content)) {
        throw new Error(
          `Message too long (${content.content.length} chars, max ${maxLength}).`
        );
      }

      // Step 1: Store the message FIRST
      const message = await messageService.storeOutboundMessage({
        clientId: user.id,
        to: user.phoneNumber,
        content: content.content || content.templateSid ? '[Template Message]' : '[MMS only]',
        provider: messageProvider,
        metadata: {
          ...(content.mediaUrls && { mediaUrls: content.mediaUrls }),
          ...(content.templateSid && { templateSid: content.templateSid }),
          ...(content.templateVariables && { templateVariables: content.templateVariables }),
        },
        deliveryStatus: 'queued',
      });

      if (!message) {
        throw new Error('Failed to store message');
      }

      console.log(`[MessagingOrchestrator] Stored message ${message.id} for user ${user.id}`);

      // Step 2: Enqueue the message reference
      const queueEntry = await queueService.enqueue(user.id, message.id, queueName);

      console.log(`[MessagingOrchestrator] Enqueued message ${message.id} in queue '${queueName}'`);

      // Step 3: Trigger Inngest to process the queue
      await inngest.send({
        name: 'message-queue/process-next',
        data: { clientId: user.id, queueName },
      });

      return { messageId: message.id, queueEntryId: queueEntry.id };
    },

    async queueMessages(
      user: UserWithProfile,
      messages: QueuedMessageContent[],
      queueName: string,
      provider?: 'twilio' | 'whatsapp'
    ): Promise<{ messageIds: string[]; queueEntryIds: string[] }> {
      if (messages.length === 0) {
        return { messageIds: [], queueEntryIds: [] };
      }

      // Determine messaging provider (only twilio or whatsapp for actual messaging)
      const messageProvider: 'twilio' | 'whatsapp' = provider || 
        (user.preferredMessagingProvider === 'whatsapp' ? 'whatsapp' : 'twilio');

      console.log(`[MessagingOrchestrator] Queueing ${messages.length} messages for user ${user.id} in queue '${queueName}' via ${messageProvider}`);

      // Validate all message lengths
      const maxLength = getSmsMaxLength();
      for (const msg of messages) {
        if (msg.content && isMessageTooLong(msg.content)) {
          throw new Error(
            `Message too long (${msg.content.length} chars, max ${maxLength}).`
          );
        }
      }

      // Step 1: Store all messages FIRST
      const storedMessages: Message[] = [];
      for (const msg of messages) {
        const stored = await messageService.storeOutboundMessage({
          clientId: user.id,
          to: user.phoneNumber,
          content: msg.content || msg.templateSid ? '[Template Message]' : '[MMS only]',
          provider: messageProvider,
          metadata: {
            ...(msg.mediaUrls && { mediaUrls: msg.mediaUrls }),
            ...(msg.templateSid && { templateSid: msg.templateSid }),
            ...(msg.templateVariables && { templateVariables: msg.templateVariables }),
          },
          deliveryStatus: 'queued',
        });

        if (!stored) {
          throw new Error('Failed to store message');
        }

        storedMessages.push(stored);
      }

      console.log(`[MessagingOrchestrator] Stored ${storedMessages.length} messages`);

      // Step 2: Enqueue all message references
      const messageIds = storedMessages.map((m) => m.id);
      const queueEntries = await queueService.enqueueMany(user.id, messageIds, queueName);

      console.log(`[MessagingOrchestrator] Created ${queueEntries.length} queue entries`);

      // Step 3: Trigger Inngest to process the queue
      await inngest.send({
        name: 'message-queue/process-next',
        data: { clientId: user.id, queueName },
      });

      return {
        messageIds,
        queueEntryIds: queueEntries.map((e) => e.id),
      };
    },

    async sendImmediate(
      user: UserWithProfile,
      content: string,
      mediaUrls?: string[],
      provider?: 'twilio' | 'whatsapp'
    ): Promise<SendResult> {
      // Determine messaging provider (only twilio or whatsapp for actual messaging)
      const messageProvider: 'twilio' | 'whatsapp' = provider || 
        (user.preferredMessagingProvider === 'whatsapp' ? 'whatsapp' : 'twilio');
      
      // Store the message first
      const message = await messageService.storeOutboundMessage({
        clientId: user.id,
        to: user.phoneNumber,
        content,
        provider: messageProvider,
        metadata: mediaUrls ? { mediaUrls } : undefined,
        deliveryStatus: 'sent',
      });

      if (!message) {
        return { success: false, error: 'Failed to store message' };
      }

      try {
        // Get the appropriate messaging client
        const client = getMessagingClientByProvider(messageProvider);
        
        // Send via provider
        const result = await client.sendMessage(user, content, mediaUrls);

        // Update with provider message ID
        if (result.messageId) {
          await messageService.updateProviderMessageId(message.id, result.messageId);
        }

        // Update status if provided
        if (result.status && result.status !== 'sent') {
          await messageService.updateDeliveryStatus(
            message.id,
            result.status as MessageDeliveryStatus
          );
        }

        // Handle local provider simulation
        if (messagingClient.provider === 'local') {
          this.simulateLocalDelivery(message.id);
        }

        console.log(`[MessagingOrchestrator] Sent immediate message ${message.id} to user ${user.id}`);

        return {
          success: true,
          messageId: message.id,
          providerMessageId: result.messageId,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[MessagingOrchestrator] Failed to send immediate message:`, errorMessage);

        // Update message status to failed
        await messageService.updateDeliveryStatus(message.id, 'failed', errorMessage);

        // Handle unsubscribed user
        if (isUnsubscribedError(errorMessage)) {
          await handleUnsubscribedUser(user.id);
        }

        return {
          success: false,
          messageId: message.id,
          error: errorMessage,
        };
      }
    },

    async processNext(clientId: string, queueName: string): Promise<void> {
      console.log(`[MessagingOrchestrator] Processing next message for client ${clientId} in queue '${queueName}'`);

      // Clean up stale pending messages older than 24 hours
      const staleCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      try {
        const deletedEntries = await queueService.deleteStalePending(staleCutoff);
        if (deletedEntries.length > 0) {
          console.log(`[MessagingOrchestrator] Deleted ${deletedEntries.length} stale pending queue entries`);

          // Mark linked messages as cancelled
          for (const entry of deletedEntries) {
            if (entry.messageId) {
              try {
                await messageService.markCancelled(entry.messageId);
              } catch (error) {
                console.error(`[MessagingOrchestrator] Failed to mark message as cancelled:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error('[MessagingOrchestrator] Error deleting stale messages:', error);
      }

      // Find next pending message
      const nextEntry = await queueService.getNextPending(clientId, queueName);

      if (!nextEntry) {
        console.log(`[MessagingOrchestrator] No more pending messages in queue '${queueName}'`);
        await queueService.clearCompleted(clientId, queueName);
        return;
      }

      console.log(`[MessagingOrchestrator] Found next message (sequence ${nextEntry.sequenceNumber})`);

      // Trigger Inngest to send this specific message
      await inngest.send({
        name: 'message-queue/send-message',
        data: {
          queueEntryId: nextEntry.id,
          clientId,
          queueName,
        },
      });
    },

    async sendQueuedMessage(queueEntryId: string): Promise<SendResult> {
      const queueEntry = await queueService.findById(queueEntryId);
      if (!queueEntry) {
        return { success: false, error: `Queue entry ${queueEntryId} not found` };
      }

      const user = await userService.getUser(queueEntry.clientId);
      if (!user) {
        return { success: false, error: `User ${queueEntry.clientId} not found` };
      }

      if (!queueEntry.messageId) {
        return { success: false, error: `Queue entry ${queueEntryId} has no message ID` };
      }

      const message = await messageService.getMessageById(queueEntry.messageId);
      if (!message) {
        return { success: false, error: `Message ${queueEntry.messageId} not found` };
      }

      // Mark queue entry as processing
      await queueService.markProcessing(queueEntryId);

      // Update message status to sent
      await messageService.updateDeliveryStatus(message.id, 'sent');

      // Get message metadata
      let mediaUrls: string[] | undefined;
      let templateSid: string | undefined;
      let templateVariables: Record<string, string> | undefined;
      
      if (message.metadata && typeof message.metadata === 'object') {
        const meta = message.metadata as { 
          mediaUrls?: string[];
          templateSid?: string;
          templateVariables?: Record<string, string>;
        };
        mediaUrls = meta.mediaUrls;
        templateSid = meta.templateSid;
        templateVariables = meta.templateVariables;
      }

      // Get the provider for this message (default to twilio if not set)
      const messageProvider = (message.provider as 'twilio' | 'whatsapp') || 'twilio';
      const client = getMessagingClientByProvider(messageProvider);

      console.log(`[MessagingOrchestrator] Sending queued message ${message.id} via ${messageProvider}`);

      try {
        const result = await client.sendMessage(
          user,
          templateSid ? undefined : message.content,
          mediaUrls,
          templateSid,
          templateVariables
        );

        if (result.messageId) {
          await messageService.updateProviderMessageId(message.id, result.messageId);
        }

        // Handle local provider simulation
        if (messagingClient.provider === 'local') {
          this.simulateLocalDelivery(message.id);
        }

        console.log(`[MessagingOrchestrator] Queued message sent successfully:`, {
          queueEntryId,
          messageId: message.id,
          providerMessageId: result.messageId,
        });

        return {
          success: true,
          messageId: message.id,
          providerMessageId: result.messageId,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`[MessagingOrchestrator] Failed to send queued message:`, {
          queueEntryId,
          messageId: message.id,
          error: errorMessage,
        });

        // Update message status to failed
        await messageService.updateDeliveryStatus(message.id, 'failed', errorMessage);

        // Handle unsubscribed user
        if (isUnsubscribedError(errorMessage)) {
          await handleUnsubscribedUser(queueEntry.clientId);
          await queueService.markFailed(queueEntryId, errorMessage);
          return { success: false, messageId: message.id, error: errorMessage };
        }

        // Handle non-retryable errors
        if (isNonRetryableError(errorMessage)) {
          console.log(`[MessagingOrchestrator] Non-retryable error, marking as failed`);
          await queueService.markFailed(queueEntryId, errorMessage);

          // Trigger next message
          await inngest.send({
            name: 'message-queue/process-next',
            data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
          });

          return { success: false, messageId: message.id, error: errorMessage };
        }

        // Check if should retry
        if (queueService.shouldRetry(queueEntry)) {
          console.log(`[MessagingOrchestrator] Retrying message (attempt ${queueEntry.retryCount + 1}/${queueEntry.maxRetries})`);
          await queueService.incrementRetryAndReset(queueEntryId, errorMessage);

          // Trigger retry via Inngest
          await inngest.send({
            name: 'message/delivery-failed',
            data: {
              messageId: message.id,
              clientId: queueEntry.clientId,
              providerMessageId: message.providerMessageId || message.id,
              error: errorMessage,
            },
          });
        } else {
          console.log(`[MessagingOrchestrator] Max retries reached, marking as failed`);
          await queueService.markFailed(queueEntryId, errorMessage);

          // Trigger next message
          await inngest.send({
            name: 'message-queue/process-next',
            data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
          });
        }

        return { success: false, messageId: message.id, error: errorMessage };
      }
    },

    async handleDeliveryConfirmation(providerMessageId: string): Promise<void> {
      // Find the queue entry by message's provider ID
      const message = await messageService.getMessageById(providerMessageId);
      if (!message) {
        // Try to find by provider message ID via the repository directly
        console.log(`[MessagingOrchestrator] Looking up message by provider ID: ${providerMessageId}`);
        return;
      }

      const queueEntry = await queueService.findByMessageId(message.id);

      if (!queueEntry) {
        console.log(`[MessagingOrchestrator] No queue entry found for message ${message.id}`);
        return;
      }

      console.log(`[MessagingOrchestrator] Marking message ${message.id} as delivered`);

      // Mark queue entry as completed
      await queueService.markCompleted(queueEntry.id);

      // Trigger next message in queue
      await inngest.send({
        name: 'message-queue/process-next',
        data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
      });

      console.log(`[MessagingOrchestrator] Triggered next message for queue '${queueEntry.queueName}'`);
    },

    async handleDeliveryFailure(providerMessageId: string, error?: string): Promise<void> {
      const message = await messageService.getMessageById(providerMessageId);
      if (!message) {
        console.log(`[MessagingOrchestrator] Message not found for provider ID: ${providerMessageId}`);
        return;
      }

      const queueEntry = await queueService.findByMessageId(message.id);

      if (!queueEntry) {
        console.log(`[MessagingOrchestrator] No queue entry found for message ${message.id}`);
        return;
      }

      console.log(`[MessagingOrchestrator] Message ${message.id} failed:`, error);

      // Handle unsubscribed user
      if (isUnsubscribedError(error)) {
        await handleUnsubscribedUser(queueEntry.clientId);
        await queueService.markFailed(queueEntry.id, error);
        return;
      }

      // Handle non-retryable errors
      if (isNonRetryableError(error)) {
        console.log(`[MessagingOrchestrator] Non-retryable error, marking as failed`);
        await queueService.markFailed(queueEntry.id, error);
        await inngest.send({
          name: 'message-queue/process-next',
          data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
        });
        return;
      }

      // Check if should retry
      if (queueService.shouldRetry(queueEntry)) {
        console.log(`[MessagingOrchestrator] Retrying message (attempt ${queueEntry.retryCount + 1}/${queueEntry.maxRetries})`);
        await queueService.incrementRetryAndReset(queueEntry.id, error);

        await inngest.send({
          name: 'message/delivery-failed',
          data: {
            messageId: message.id,
            clientId: queueEntry.clientId,
            providerMessageId: providerMessageId,
            error: error || 'Unknown error',
          },
        });
      } else {
        console.log(`[MessagingOrchestrator] Max retries reached, marking as failed`);
        await queueService.markFailed(queueEntry.id, error);

        await inngest.send({
          name: 'message-queue/process-next',
          data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
        });
      }
    },

    async checkStalledMessages(): Promise<void> {
      const cutoffDate = new Date(Date.now() - 10 * 60 * 1000);
      const stalledEntries = await queueService.findStalled(cutoffDate);

      if (stalledEntries.length === 0) {
        console.log('[MessagingOrchestrator] No stalled messages found');
        return;
      }

      console.log(`[MessagingOrchestrator] Found ${stalledEntries.length} stalled messages`);

      for (const entry of stalledEntries) {
        try {
          if (!entry.messageId) {
            console.warn(`[MessagingOrchestrator] Queue entry ${entry.id} has no message ID`);
            await queueService.markCompleted(entry.id);
            await this.processNext(entry.clientId, entry.queueName);
            continue;
          }

          const message = await messageService.getMessageById(entry.messageId);

          if (!message || !message.providerMessageId) {
            console.warn(`[MessagingOrchestrator] Message ${entry.messageId} not found or has no provider ID`);
            await queueService.markCompleted(entry.id);
            await this.processNext(entry.clientId, entry.queueName);
            continue;
          }

          console.log(`[MessagingOrchestrator] Checking Twilio status for ${message.providerMessageId}`);
          const twilioMessage = await twilioClient.getMessageStatus(message.providerMessageId);

          if (twilioMessage.status === 'delivered') {
            console.log(`[MessagingOrchestrator] Twilio confirms delivery, updating queue`);
            await messageService.updateDeliveryStatus(message.id, 'delivered');
            await queueService.markCompleted(entry.id);
            await this.processNext(entry.clientId, entry.queueName);
          } else if (twilioMessage.status === 'failed' || twilioMessage.status === 'undelivered') {
            console.log(`[MessagingOrchestrator] Twilio confirms failure, updating queue`);
            await messageService.updateDeliveryStatus(message.id, twilioMessage.status as 'failed' | 'undelivered');
            await this.handleDeliveryFailure(message.id, `Stalled message status: ${twilioMessage.status}`);
          } else {
            console.log(`[MessagingOrchestrator] Message still in transit (${twilioMessage.status}), assuming delivered`);
            await messageService.updateDeliveryStatus(message.id, 'delivered');
            await queueService.markCompleted(entry.id);
            await this.processNext(entry.clientId, entry.queueName);
          }
        } catch (error) {
          console.error(`[MessagingOrchestrator] Error checking stalled message ${entry.id}:`, error);
          await queueService.markCompleted(entry.id);
          await this.processNext(entry.clientId, entry.queueName);
        }
      }
    },

    async cleanupStuckMessages(): Promise<{ cleaned: number; delivered: number; failed: number; cancelled: number }> {
      // 24-hour threshold for stuck messages
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const batchSize = 100;

      console.log('[MessagingOrchestrator] Looking for stuck messages older than:', cutoffDate.toISOString());

      const stuckMessages = await messageService.findStuckMessages(cutoffDate, batchSize);

      if (stuckMessages.length === 0) {
        console.log('[MessagingOrchestrator] No stuck messages found');
        return { cleaned: 0, delivered: 0, failed: 0, cancelled: 0 };
      }

      console.log(`[MessagingOrchestrator] Found ${stuckMessages.length} stuck messages to clean up`);

      let delivered = 0;
      let failed = 0;
      let cancelled = 0;

      for (const message of stuckMessages) {
        try {
          // If no provider message ID, we never sent it - mark as cancelled
          if (!message.providerMessageId) {
            console.log(`[MessagingOrchestrator] Message ${message.id} has no provider ID, marking as cancelled`);
            await messageService.markCancelled(message.id);
            cancelled++;
            continue;
          }

          // Query Twilio for actual status
          console.log(`[MessagingOrchestrator] Checking Twilio status for message ${message.id} (${message.providerMessageId})`);
          const twilioMessage = await twilioClient.getMessageStatus(message.providerMessageId);

          if (twilioMessage.status === 'delivered') {
            console.log(`[MessagingOrchestrator] Message ${message.id} confirmed delivered by Twilio`);
            await messageService.updateDeliveryStatus(message.id, 'delivered');
            delivered++;
          } else if (twilioMessage.status === 'failed' || twilioMessage.status === 'undelivered') {
            console.log(`[MessagingOrchestrator] Message ${message.id} confirmed failed by Twilio: ${twilioMessage.status}`);
            await messageService.updateDeliveryStatus(
              message.id,
              twilioMessage.status as 'failed' | 'undelivered',
              `Twilio status: ${twilioMessage.status}`
            );
            failed++;
          } else if (twilioMessage.status === 'sent' || twilioMessage.status === 'queued') {
            // Still in transit after 24 hours - assume delivered (Twilio webhook missed)
            console.log(`[MessagingOrchestrator] Message ${message.id} still shows ${twilioMessage.status} after 24h, assuming delivered`);
            await messageService.updateDeliveryStatus(message.id, 'delivered');
            delivered++;
          } else {
            // Unknown status - mark as delivered to clear it
            console.log(`[MessagingOrchestrator] Message ${message.id} has unknown status ${twilioMessage.status}, marking as delivered`);
            await messageService.updateDeliveryStatus(message.id, 'delivered');
            delivered++;
          }
        } catch (error) {
          console.error(`[MessagingOrchestrator] Error cleaning up message ${message.id}:`, error);
          // Mark as failed if we can't check Twilio (e.g., message not found)
          try {
            await messageService.updateDeliveryStatus(message.id, 'failed', 'Failed to verify with Twilio');
            failed++;
          } catch (updateError) {
            console.error(`[MessagingOrchestrator] Failed to update message status:`, updateError);
          }
        }
      }

      const cleaned = delivered + failed + cancelled;
      console.log(`[MessagingOrchestrator] Cleanup complete:`, { cleaned, delivered, failed, cancelled });

      return { cleaned, delivered, failed, cancelled };
    },

    async cancelAllPendingMessages(clientId: string): Promise<number> {
      console.log(`[MessagingOrchestrator] Canceling all pending messages for client ${clientId}`);

      // Get all pending entries first to mark messages as cancelled
      const pendingDailyEntries = await queueService.getPendingByClient(clientId, 'daily');
      const pendingOnboardingEntries = await queueService.getPendingByClient(clientId, 'onboarding');
      const allPending = [...pendingDailyEntries, ...pendingOnboardingEntries];

      // Mark all linked messages as cancelled
      for (const entry of allPending) {
        if (entry.messageId) {
          try {
            await messageService.markCancelled(entry.messageId);
          } catch (error) {
            console.error(`[MessagingOrchestrator] Failed to mark message as cancelled:`, error);
          }
        }
      }

      // Cancel all queue entries
      const count = await queueService.cancelAllForClient(clientId);
      console.log(`[MessagingOrchestrator] Canceled ${count} pending messages for client ${clientId}`);
      return count;
    },

    async cancelQueueEntry(queueEntryId: string): Promise<{ success: boolean; error?: string }> {
      try {
        const queueEntry = await queueService.findById(queueEntryId);

        if (!queueEntry) {
          return { success: false, error: 'Queue entry not found' };
        }

        // Only allow cancellation of pending or processing entries
        if (queueEntry.status !== 'pending' && queueEntry.status !== 'processing') {
          return { success: false, error: `Cannot cancel entry with status: ${queueEntry.status}` };
        }

        console.log(`[MessagingOrchestrator] Canceling queue entry ${queueEntryId}`);

        // Mark the linked message as cancelled
        if (queueEntry.messageId) {
          try {
            await messageService.markCancelled(queueEntry.messageId);
          } catch (error) {
            console.error(`[MessagingOrchestrator] Failed to mark message as cancelled:`, error);
          }
        }

        // Delete the queue entry
        await queueService.cancelEntry(queueEntryId);

        // Trigger processing of next message
        await inngest.send({
          name: 'message-queue/process-next',
          data: { clientId: queueEntry.clientId, queueName: queueEntry.queueName },
        });

        console.log(`[MessagingOrchestrator] Queue entry ${queueEntryId} cancelled successfully`);
        return { success: true };
      } catch (error) {
        console.error(`[MessagingOrchestrator] Error canceling queue entry:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },

    async getQueueStatus(clientId: string, queueName: string) {
      return await queueService.getQueueStatus(clientId, queueName);
    },

    async clearQueue(clientId: string, queueName: string): Promise<void> {
      console.log(`[MessagingOrchestrator] Clearing completed queue '${queueName}' for client ${clientId}`);
      await queueService.clearCompleted(clientId, queueName);
    },

    // Internal helper for local provider simulation
    simulateLocalDelivery(messageId: string): void {
      const delay = 1500;
      console.log(`[MessagingOrchestrator] Simulating local delivery in ${delay}ms for message ${messageId}`);

      setTimeout(async () => {
        try {
          await messageService.updateDeliveryStatus(messageId, 'delivered');
          await this.handleDeliveryConfirmation(messageId);
          console.log(`[MessagingOrchestrator] Local delivery simulation complete for message ${messageId}`);
        } catch (error) {
          console.error(`[MessagingOrchestrator] Local delivery simulation failed:`, error);
        }
      }, delay);
    },
  } as MessagingOrchestratorInstance & { simulateLocalDelivery(messageId: string): void };
}
