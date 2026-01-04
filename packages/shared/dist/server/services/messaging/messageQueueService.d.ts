import { Message } from '@/server/models/conversation';
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
export declare class MessageQueueService {
    private static instance;
    private messageQueueRepo;
    private constructor();
    static getInstance(): MessageQueueService;
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
    enqueueMessages(clientId: string, messages: QueuedMessage[], queueName: string): Promise<void>;
    /**
     * Process the next pending message in a queue
     *
     * Sends the next message via MessageService and updates queue status.
     * Called by Inngest when the previous message is delivered.
     *
     * @param clientId - Client ID
     * @param queueName - Queue name
     */
    processNextMessage(clientId: string, queueName: string): Promise<void>;
    /**
     * Send a queued message
     * Called by Inngest function to actually send the message
     */
    sendQueuedMessage(queueEntryId: string): Promise<Message>;
    /**
     * Mark a message as delivered and trigger next message
     *
     * Called by Twilio webhook when message status is 'delivered'.
     * Updates queue entry and triggers next message in queue.
     *
     * @param messageId - ID of the delivered message
     */
    markMessageDelivered(messageId: string): Promise<void>;
    /**
     * Mark a message as failed and optionally retry or move to next
     *
     * Called by Twilio webhook when message status is 'failed' or 'undelivered'.
     * Retries if under max retries, otherwise marks failed and moves to next.
     *
     * @param messageId - ID of the failed message
     * @param error - Error message from Twilio
     */
    markMessageFailed(messageId: string, error?: string): Promise<void>;
    /**
     * Check for stalled messages and unblock queues
     *
     * Finds messages that have been in 'sent' status for longer than
     * their timeout period. Verifies actual status with Twilio API.
     *
     * Called by scheduled Inngest cron job.
     */
    checkStalledMessages(): Promise<void>;
    /**
     * Get queue status for a client
     */
    getQueueStatus(clientId: string, queueName: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        delivered: number;
        failed: number;
    }>;
    /**
     * Clear completed/failed queue entries
     */
    clearQueue(clientId: string, queueName: string): Promise<void>;
}
export declare const messageQueueService: MessageQueueService;
//# sourceMappingURL=messageQueueService.d.ts.map