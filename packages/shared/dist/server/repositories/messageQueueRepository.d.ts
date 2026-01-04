import { BaseRepository } from '@/server/repositories/baseRepository';
import type { MessageQueues } from '@/server/models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';
export type MessageQueue = Selectable<MessageQueues>;
export type NewMessageQueue = Insertable<MessageQueues>;
export type MessageQueueUpdate = Updateable<MessageQueues>;
export declare class MessageQueueRepository extends BaseRepository {
    /**
     * Create a new queue entry
     */
    create(queueEntry: NewMessageQueue): Promise<MessageQueue>;
    /**
     * Bulk insert multiple queue entries
     */
    createMany(queueEntries: NewMessageQueue[]): Promise<MessageQueue[]>;
    /**
     * Find queue entry by ID
     */
    findById(id: string): Promise<MessageQueue | undefined>;
    /**
     * Find queue entry by message ID (for webhook lookups)
     */
    findByMessageId(messageId: string): Promise<MessageQueue | undefined>;
    /**
     * Find all pending entries for a client's queue, ordered by sequence
     */
    findPendingByClient(clientId: string, queueName: string): Promise<MessageQueue[]>;
    /**
     * Find all pending queue items globally for admin view
     */
    findAllPending(params: {
        limit?: number;
        offset?: number;
        clientId?: string;
    }): Promise<MessageQueue[]>;
    /**
     * Find all pending queue items with user info for admin view
     */
    findAllPendingWithUserInfo(params: {
        limit?: number;
        clientId?: string;
    }): Promise<(MessageQueue & {
        userName: string | null;
        userPhone: string;
    })[]>;
    /**
     * Find the next pending message in a queue
     */
    findNextPending(clientId: string, queueName: string): Promise<MessageQueue | undefined>;
    /**
     * Find stalled messages (sent but not delivered/failed after timeout)
     */
    findStalled(cutoffDate: Date): Promise<MessageQueue[]>;
    /**
     * Update queue entry status
     */
    updateStatus(id: string, status: 'pending' | 'sent' | 'delivered' | 'failed', timestamps?: {
        sentAt?: Date;
        deliveredAt?: Date;
    }, error?: string): Promise<MessageQueue>;
    /**
     * Link a queue entry to a sent message
     */
    linkMessage(id: string, messageId: string): Promise<MessageQueue>;
    /**
     * Increment retry count
     */
    incrementRetry(id: string): Promise<MessageQueue>;
    /**
     * Delete completed/failed queue entries for cleanup
     */
    deleteCompleted(clientId: string, queueName: string): Promise<void>;
    /**
     * Get queue status summary
     */
    getQueueStatus(clientId: string, queueName: string): Promise<{
        total: number;
        pending: number;
        sent: number;
        delivered: number;
        failed: number;
    }>;
}
//# sourceMappingURL=messageQueueRepository.d.ts.map