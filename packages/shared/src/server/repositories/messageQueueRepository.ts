import { BaseRepository } from '@/server/repositories/baseRepository';
import type { MessageQueues } from '@/server/models/_types';
import type { Insertable, Selectable, Updateable } from 'kysely';

export type MessageQueue = Selectable<MessageQueues>;
export type NewMessageQueue = Insertable<MessageQueues>;
export type MessageQueueUpdate = Updateable<MessageQueues>;

export class MessageQueueRepository extends BaseRepository {
  /**
   * Create a new queue entry
   */
  async create(queueEntry: NewMessageQueue): Promise<MessageQueue> {
    return await this.db
      .insertInto('messageQueues')
      .values(queueEntry)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Bulk insert multiple queue entries
   */
  async createMany(queueEntries: NewMessageQueue[]): Promise<MessageQueue[]> {
    if (queueEntries.length === 0) return [];

    return await this.db
      .insertInto('messageQueues')
      .values(queueEntries)
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
  }): Promise<(MessageQueue & { userName: string | null; userPhone: string })[]> {
    let query = this.db
      .selectFrom('messageQueues')
      .innerJoin('users', 'users.id', 'messageQueues.clientId')
      .select([
        'messageQueues.id',
        'messageQueues.clientId',
        'messageQueues.queueName',
        'messageQueues.sequenceNumber',
        'messageQueues.messageContent',
        'messageQueues.mediaUrls',
        'messageQueues.status',
        'messageQueues.messageId',
        'messageQueues.retryCount',
        'messageQueues.maxRetries',
        'messageQueues.timeoutMinutes',
        'messageQueues.errorMessage',
        'messageQueues.createdAt',
        'messageQueues.sentAt',
        'messageQueues.deliveredAt',
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

    return results as (MessageQueue & { userName: string | null; userPhone: string })[];
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
   * Find stalled messages (sent but not delivered/failed after timeout)
   */
  async findStalled(cutoffDate: Date): Promise<MessageQueue[]> {
    return await this.db
      .selectFrom('messageQueues')
      .selectAll()
      .where('status', '=', 'sent')
      .where('sentAt', '<', cutoffDate)
      .execute();
  }

  /**
   * Update queue entry status
   */
  async updateStatus(
    id: string,
    status: 'pending' | 'sent' | 'delivered' | 'failed',
    timestamps?: { sentAt?: Date; deliveredAt?: Date },
    error?: string
  ): Promise<MessageQueue> {
    return await this.db
      .updateTable('messageQueues')
      .set({
        status,
        ...(timestamps?.sentAt && { sentAt: timestamps.sentAt }),
        ...(timestamps?.deliveredAt && { deliveredAt: timestamps.deliveredAt }),
        ...(error && { errorMessage: error }),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Link a queue entry to a sent message
   */
  async linkMessage(id: string, messageId: string): Promise<MessageQueue> {
    return await this.db
      .updateTable('messageQueues')
      .set({
        messageId,
        status: 'sent',
        sentAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
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
      .where('status', 'in', ['delivered', 'failed'])
      .execute();
  }

  /**
   * Get queue status summary
   */
  async getQueueStatus(clientId: string, queueName: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    delivered: number;
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
      pending: entries.filter(e => e.status === 'pending').length,
      sent: entries.filter(e => e.status === 'sent').length,
      delivered: entries.filter(e => e.status === 'delivered').length,
      failed: entries.filter(e => e.status === 'failed').length,
    };
  }
}
