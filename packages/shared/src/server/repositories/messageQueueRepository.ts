import { BaseRepository } from '@/server/repositories/baseRepository';
import type { MessageQueues } from '@/server/models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type MessageQueue = Selectable<MessageQueues>;
export type NewMessageQueue = Insertable<MessageQueues>;
export type MessageQueueUpdate = Updateable<MessageQueues>;

/**
 * Entry for creating a queue item (message-first approach)
 * The message must already exist in the messages table
 */
export interface QueueEntryCreate {
  clientId: string;
  messageId: string;
  queueName: string;
  sequenceNumber: number;
}

export class MessageQueueRepository extends BaseRepository {
  /**
   * Create a new queue entry with a reference to an existing message
   */
  async create(entry: QueueEntryCreate): Promise<MessageQueue> {
    return await this.db
      .insertInto('messageQueues')
      .values({
        clientId: entry.clientId,
        messageId: entry.messageId,
        queueName: entry.queueName,
        sequenceNumber: entry.sequenceNumber,
        status: 'pending',
      })
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Bulk insert multiple queue entries
   * Each entry must reference an existing message
   */
  async createMany(entries: QueueEntryCreate[]): Promise<MessageQueue[]> {
    if (entries.length === 0) return [];

    const values = entries.map((entry) => ({
      clientId: entry.clientId,
      messageId: entry.messageId,
      queueName: entry.queueName,
      sequenceNumber: entry.sequenceNumber,
      status: 'pending' as const,
    }));

    return await this.db
      .insertInto('messageQueues')
      .values(values)
      .returningAll()
      .execute();
  }

  /**
   * Find queue entry by ID
   */
  async findById(id: string): Promise<MessageQueue | undefined> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  /**
   * Find queue entry by message ID (for webhook lookups)
   */
  async findByMessageId(messageId: string): Promise<MessageQueue | undefined> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('messageId', '=', messageId)
      .executeTakeFirst();
  }

  /**
   * Find all pending entries for a client's queue, ordered by sequence
   */
  async findPendingByClient(
    clientId: string,
    queueName: string
  ): Promise<MessageQueue[]> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('queueName', '=', queueName)
      .where('status', '=', 'pending')
      .orderBy('sequenceNumber', 'asc')
      .execute();
  }

  /**
   * Find all pending queue items globally for admin view
   */
  async findAllPending(params: {
    limit?: number;
    offset?: number;
    clientId?: string;
  }): Promise<MessageQueue[]> {
    let query = this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('status', '=', 'pending');

    if (params.clientId) {
      query = query.where('clientId', '=', params.clientId);
    }

    return await query
      .orderBy('createdAt', 'desc')
      .limit(params.limit || 100)
      .offset(params.offset || 0)
      .execute();
  }

  /**
   * Find all pending queue items with user info for admin view
   */
  async findAllPendingWithUserInfo(params: {
    limit?: number;
    clientId?: string;
  }): Promise<(MessageQueue & { userName: string | null; userPhone: string; messageContent?: string })[]> {
    let query = this.db
      .selectFrom('messageQueues')
      .innerJoin('users', 'users.id', 'messageQueues.clientId')
      .innerJoin('messages', 'messages.id', 'messageQueues.messageId')
      .select([
        'messageQueues.id',
        'messageQueues.clientId',
        'messageQueues.queueName',
        'messageQueues.sequenceNumber',
        'messageQueues.status',
        'messageQueues.messageId',
        'messageQueues.retryCount',
        'messageQueues.maxRetries',
        'messageQueues.errorMessage',
        'messageQueues.createdAt',
        'messageQueues.processedAt',
        'messages.content as messageContent',
        'users.name as userName',
        'users.phoneNumber as userPhone',
      ])
      .where('messageQueues.status', '=', 'pending');

    if (params.clientId) {
      query = query.where('messageQueues.clientId', '=', params.clientId);
    }

    const results = await query
      .orderBy('messageQueues.createdAt', 'desc')
      .limit(params.limit || 100)
      .execute();

    return results as unknown as (MessageQueue & { userName: string | null; userPhone: string; messageContent?: string })[];
  }

  /**
   * Find the next pending message in a queue
   */
  async findNextPending(
    clientId: string,
    queueName: string
  ): Promise<MessageQueue | undefined> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('clientId', '=', clientId)
      .where('queueName', '=', queueName)
      .where('status', '=', 'pending')
      .orderBy('sequenceNumber', 'asc')
      .limit(1)
      .executeTakeFirst();
  }

  /**
   * Find stalled messages (processing but not completed after timeout)
   */
  async findStalled(cutoffDate: Date): Promise<MessageQueue[]> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('status', '=', 'processing')
      .where('createdAt', '<', cutoffDate)
      .execute();
  }

  /**
   * Mark a queue entry as processing
   */
  async markProcessing(id: string): Promise<MessageQueue> {
    return await this.db
      .updateTable('messageQueues')
      .set({
        status: 'processing',
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark a queue entry as completed
   */
  async markCompleted(id: string): Promise<MessageQueue> {
    return await this.db
      .updateTable('messageQueues')
      .set({
        status: 'completed',
        processedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Mark a queue entry as failed
   */
  async markFailed(id: string, error?: string): Promise<MessageQueue> {
    return await this.db
      .updateTable('messageQueues')
      .set({
        status: 'failed',
        errorMessage: error || null,
        processedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Update queue entry status (generic method)
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    error?: string
  ): Promise<MessageQueue> {
    const updateData: Record<string, unknown> = {
      status,
      ...(error && { errorMessage: error }),
      ...(status === 'completed' || status === 'failed' ? { processedAt: new Date() } : {}),
    };

    return await this.db
      .updateTable('messageQueues')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Delete a queue entry by ID
   * Returns the deleted queue entry
   */
  async deleteById(id: string): Promise<MessageQueue | undefined> {
    return await this.db
      .deleteFrom('messageQueues')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
  }

  /**
   * Delete stale pending entries older than the cutoff date
   * Returns the deleted entries (with messageIds for marking as cancelled)
   */
  async deleteStalePending(cutoffDate: Date): Promise<MessageQueue[]> {
    return await this.db
      .deleteFrom('messageQueues')
      .where('status', '=', 'pending')
      .where('createdAt', '<', cutoffDate)
      .returningAll()
      .execute();
  }

  /**
   * Increment retry count
   */
  async incrementRetry(id: string): Promise<MessageQueue> {
    const entry = await this.findById(id);
    if (!entry) {
      throw new Error(`Queue entry ${id} not found`);
    }

    return await this.db
      .updateTable('messageQueues')
      .set({
        retryCount: entry.retryCount + 1,
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Delete completed/failed queue entries for cleanup
   */
  async deleteCompleted(clientId: string, queueName: string): Promise<void> {
    await this.db
      .deleteFrom('messageQueues')
      .where('clientId', '=', clientId)
      .where('queueName', '=', queueName)
      .where('status', 'in', ['completed', 'failed'])
      .execute();
  }

  /**
   * Cancel all pending messages for a client across all queues
   * Returns the count of deleted messages
   */
  async cancelAllPendingForClient(clientId: string): Promise<number> {
    const result = await this.db
      .deleteFrom('messageQueues')
      .where('clientId', '=', clientId)
      .where('status', '=', 'pending')
      .executeTakeFirst();

    return Number(result.numDeletedRows ?? 0);
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus(clientId: string, queueName: string): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const entries = await this.db
      .selectFrom('messageQueues')
      .select(['status'])
      .where('clientId', '=', clientId)
      .where('queueName', '=', queueName)
      .execute();

    return {
      total: entries.length,
      pending: entries.filter((e) => e.status === 'pending').length,
      processing: entries.filter((e) => e.status === 'processing').length,
      completed: entries.filter((e) => e.status === 'completed').length,
      failed: entries.filter((e) => e.status === 'failed').length,
    };
  }
}
