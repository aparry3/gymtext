import type { RepositoryContainer } from '../../../repositories/factory';
import type { MessageQueue, QueueEntryCreate } from '../../../repositories/messageQueueRepository';

/**
 * QueueServiceInstance interface
 *
 * Domain service for message queue ordering and state management.
 * This service only manages the queue - it does NOT store message content
 * or handle message sending.
 *
 * Responsibilities:
 * - Enqueue message references (message_id only)
 * - Track queue ordering (sequence numbers)
 * - Manage queue entry states (pending -> processing -> completed/failed)
 * - Handle retry logic and backoff
 * - Cancel queue entries
 */
export interface QueueServiceInstance {
  /**
   * Enqueue a single message reference
   */
  enqueue(
    clientId: string,
    messageId: string,
    queueName: string,
    sequenceNumber?: number
  ): Promise<MessageQueue>;

  /**
   * Enqueue multiple message references (for batch operations)
   */
  enqueueMany(
    clientId: string,
    messageIds: string[],
    queueName: string
  ): Promise<MessageQueue[]>;

  /**
   * Get the next pending entry in a queue
   */
  getNextPending(clientId: string, queueName: string): Promise<MessageQueue | undefined>;

  /**
   * Get all pending entries for a client's queue
   */
  getPendingByClient(clientId: string, queueName: string): Promise<MessageQueue[]>;

  /**
   * Mark a queue entry as processing (being sent)
   */
  markProcessing(entryId: string): Promise<MessageQueue>;

  /**
   * Mark a queue entry as completed (delivered)
   */
  markCompleted(entryId: string): Promise<MessageQueue>;

  /**
   * Mark a queue entry as failed
   */
  markFailed(entryId: string, error?: string): Promise<MessageQueue>;

  /**
   * Check if a queue entry should be retried
   */
  shouldRetry(entry: MessageQueue): boolean;

  /**
   * Increment retry count and reset to pending for retry
   */
  incrementRetryAndReset(entryId: string, error?: string): Promise<MessageQueue>;

  /**
   * Cancel a specific queue entry
   * Returns the deleted entry (or undefined if not found)
   */
  cancelEntry(entryId: string): Promise<MessageQueue | undefined>;

  /**
   * Cancel all pending entries for a client
   * Returns count of cancelled entries
   */
  cancelAllForClient(clientId: string): Promise<number>;

  /**
   * Delete stale pending entries older than cutoff
   * Returns deleted entries (for marking linked messages as cancelled)
   */
  deleteStalePending(cutoffDate: Date): Promise<MessageQueue[]>;

  /**
   * Get queue status summary
   */
  getQueueStatus(clientId: string, queueName: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }>;

  /**
   * Delete completed/failed entries for cleanup
   */
  clearCompleted(clientId: string, queueName: string): Promise<void>;

  /**
   * Find queue entry by ID
   */
  findById(entryId: string): Promise<MessageQueue | undefined>;

  /**
   * Find queue entry by message ID
   */
  findByMessageId(messageId: string): Promise<MessageQueue | undefined>;

  /**
   * Find stalled entries (processing but not completed/failed after timeout)
   */
  findStalled(cutoffDate: Date): Promise<MessageQueue[]>;
}

/**
 * Create a QueueService instance
 *
 * This is a pure domain service with no service dependencies.
 * It only works with the messageQueue repository.
 */
export function createQueueService(repos: RepositoryContainer): QueueServiceInstance {
  return {
    async enqueue(
      clientId: string,
      messageId: string,
      queueName: string,
      sequenceNumber?: number
    ): Promise<MessageQueue> {
      // If no sequence number provided, get the next one
      let seq = sequenceNumber;
      if (seq === undefined) {
        const pending = await repos.messageQueue.findPendingByClient(clientId, queueName);
        seq = pending.length > 0
          ? Math.max(...pending.map((e) => e.sequenceNumber)) + 1
          : 1;
      }

      const entry: QueueEntryCreate = {
        clientId,
        messageId,
        queueName,
        sequenceNumber: seq,
      };

      return await repos.messageQueue.create(entry);
    },

    async enqueueMany(
      clientId: string,
      messageIds: string[],
      queueName: string
    ): Promise<MessageQueue[]> {
      if (messageIds.length === 0) return [];

      // Get the starting sequence number
      const pending = await repos.messageQueue.findPendingByClient(clientId, queueName);
      const startSeq = pending.length > 0
        ? Math.max(...pending.map((e) => e.sequenceNumber)) + 1
        : 1;

      const entries: QueueEntryCreate[] = messageIds.map((messageId, index) => ({
        clientId,
        messageId,
        queueName,
        sequenceNumber: startSeq + index,
      }));

      return await repos.messageQueue.createMany(entries);
    },

    async getNextPending(clientId: string, queueName: string): Promise<MessageQueue | undefined> {
      return await repos.messageQueue.findNextPending(clientId, queueName);
    },

    async getPendingByClient(clientId: string, queueName: string): Promise<MessageQueue[]> {
      return await repos.messageQueue.findPendingByClient(clientId, queueName);
    },

    async markProcessing(entryId: string): Promise<MessageQueue> {
      return await repos.messageQueue.markProcessing(entryId);
    },

    async markCompleted(entryId: string): Promise<MessageQueue> {
      return await repos.messageQueue.markCompleted(entryId);
    },

    async markFailed(entryId: string, error?: string): Promise<MessageQueue> {
      return await repos.messageQueue.markFailed(entryId, error);
    },

    shouldRetry(entry: MessageQueue): boolean {
      return entry.retryCount < entry.maxRetries;
    },

    async incrementRetryAndReset(entryId: string, error?: string): Promise<MessageQueue> {
      // First increment the retry count
      await repos.messageQueue.incrementRetry(entryId);

      // Then reset status to pending with error message
      return await repos.messageQueue.updateStatus(entryId, 'pending', error);
    },

    async cancelEntry(entryId: string): Promise<MessageQueue | undefined> {
      return await repos.messageQueue.deleteById(entryId);
    },

    async cancelAllForClient(clientId: string): Promise<number> {
      return await repos.messageQueue.cancelAllPendingForClient(clientId);
    },

    async deleteStalePending(cutoffDate: Date): Promise<MessageQueue[]> {
      return await repos.messageQueue.deleteStalePending(cutoffDate);
    },

    async getQueueStatus(clientId: string, queueName: string) {
      return await repos.messageQueue.getQueueStatus(clientId, queueName);
    },

    async clearCompleted(clientId: string, queueName: string): Promise<void> {
      await repos.messageQueue.deleteCompleted(clientId, queueName);
    },

    async findById(entryId: string): Promise<MessageQueue | undefined> {
      return await repos.messageQueue.findById(entryId);
    },

    async findByMessageId(messageId: string): Promise<MessageQueue | undefined> {
      return await repos.messageQueue.findByMessageId(messageId);
    },

    async findStalled(cutoffDate: Date): Promise<MessageQueue[]> {
      return await repos.messageQueue.findStalled(cutoffDate);
    },
  };
}
