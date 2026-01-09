import { sql } from 'kysely';
import { BaseRepository } from '@/server/repositories/baseRepository';
import type {
  Message,
  NewMessage,
} from '@/server/models/message';

export class MessageRepository extends BaseRepository {
  async create(message: NewMessage): Promise<Message> {
    return await this.db
      .insertInto('messages')
      .values(message)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<Message | undefined> {
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByClientId(clientId: string, limit: number = 50, offset: number = 0): Promise<Message[]> {
    // Return messages in DESC order (latest first) with pagination support
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();
  }

  /**
   * Find recent messages for a client, ordered oldest to newest
   * This is the primary method for getting message history
   */
  async findRecentByClientId(clientId: string, limit: number = 10): Promise<Message[]> {
    const messages = await this.db
      .selectFrom('messages')
      .selectAll()
      .where('clientId', '=', clientId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();

    // Reverse to get oldest-to-newest order (for chat context)
    return messages.reverse();
  }

  async countByClientId(clientId: string): Promise<number> {
    const result = await this.db
      .selectFrom('messages')
      .select(({ fn }) => fn.count('id').as('count'))
      .where('clientId', '=', clientId)
      .executeTakeFirst();

    return Number(result?.count ?? 0);
  }

  async findByProviderMessageId(providerMessageId: string): Promise<Message | undefined> {
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('providerMessageId', '=', providerMessageId)
      .executeTakeFirst();
  }

  async updateDeliveryStatus(
    messageId: string,
    status: 'queued' | 'sent' | 'delivered' | 'failed' | 'undelivered',
    error?: string
  ): Promise<Message> {
    return await this.db
      .updateTable('messages')
      .set({
        deliveryStatus: status,
        deliveryError: error || null,
        lastDeliveryAttemptAt: new Date(),
      })
      .where('id', '=', messageId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async incrementDeliveryAttempts(messageId: string): Promise<Message> {
    const message = await this.findById(messageId);
    if (!message) {
      throw new Error(`Message ${messageId} not found`);
    }

    return await this.db
      .updateTable('messages')
      .set({
        deliveryAttempts: (message.deliveryAttempts || 1) + 1,
        lastDeliveryAttemptAt: new Date(),
      })
      .where('id', '=', messageId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateProviderMessageId(messageId: string, providerMessageId: string): Promise<Message> {
    return await this.db
      .updateTable('messages')
      .set({ providerMessageId })
      .where('id', '=', messageId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  /**
   * Find all messages with user info for admin view
   * Supports filtering by direction, status, and search
   */
  async findAllWithUserInfo(params: {
    limit?: number;
    offset?: number;
    direction?: 'inbound' | 'outbound';
    status?: string;
    search?: string;
    clientId?: string;
  }): Promise<{
    messages: (Message & { userName: string | null; userPhone: string })[];
    total: number;
  }> {
    let query = this.db
      .selectFrom('messages')
      .innerJoin('users', 'users.id', 'messages.clientId')
      .select([
        'messages.id',
        'messages.clientId',
        'messages.conversationId',
        'messages.direction',
        'messages.content',
        'messages.phoneFrom',
        'messages.phoneTo',
        'messages.provider',
        'messages.providerMessageId',
        'messages.deliveryStatus',
        'messages.deliveryAttempts',
        'messages.lastDeliveryAttemptAt',
        'messages.deliveryError',
        'messages.metadata',
        'messages.createdAt',
        'users.name as userName',
        'users.phoneNumber as userPhone',
      ]);

    // Apply filters
    if (params.clientId) {
      query = query.where('messages.clientId', '=', params.clientId);
    }
    if (params.direction) {
      query = query.where('messages.direction', '=', params.direction);
    }
    if (params.status) {
      query = query.where('messages.deliveryStatus', '=', params.status);
    }
    if (params.search) {
      query = query.where((eb) =>
        eb.or([
          eb('messages.phoneFrom', 'ilike', `%${params.search}%`),
          eb('messages.phoneTo', 'ilike', `%${params.search}%`),
          eb('users.name', 'ilike', `%${params.search}%`),
          eb('users.phoneNumber', 'ilike', `%${params.search}%`),
        ])
      );
    }

    // Get total count with same filters
    let countQuery = this.db
      .selectFrom('messages')
      .innerJoin('users', 'users.id', 'messages.clientId')
      .select(({ fn }) => fn.count('messages.id').as('count'));

    if (params.clientId) {
      countQuery = countQuery.where('messages.clientId', '=', params.clientId);
    }
    if (params.direction) {
      countQuery = countQuery.where('messages.direction', '=', params.direction);
    }
    if (params.status) {
      countQuery = countQuery.where('messages.deliveryStatus', '=', params.status);
    }
    if (params.search) {
      countQuery = countQuery.where((eb) =>
        eb.or([
          eb('messages.phoneFrom', 'ilike', `%${params.search}%`),
          eb('messages.phoneTo', 'ilike', `%${params.search}%`),
          eb('users.name', 'ilike', `%${params.search}%`),
          eb('users.phoneNumber', 'ilike', `%${params.search}%`),
        ])
      );
    }

    const countResult = await countQuery.executeTakeFirst();
    const total = Number(countResult?.count ?? 0);

    // Get paginated results
    const messages = await query
      .orderBy('messages.createdAt', 'desc')
      .limit(params.limit || 50)
      .offset(params.offset || 0)
      .execute();

    return {
      messages: messages as (Message & { userName: string | null; userPhone: string })[],
      total,
    };
  }

  /**
   * Get message statistics for admin view
   */
  async getStats(clientId?: string): Promise<{
    totalMessages: number;
    inbound: number;
    outbound: number;
    pending: number;
    failed: number;
  }> {
    let baseQuery = this.db.selectFrom('messages');

    if (clientId) {
      baseQuery = baseQuery.where('clientId', '=', clientId);
    }

    const [total, inbound, outbound, pending, failed] = await Promise.all([
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('direction', '=', 'inbound')
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('direction', '=', 'outbound')
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('deliveryStatus', 'in', ['queued', 'sent'])
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('deliveryStatus', 'in', ['failed', 'undelivered'])
        .executeTakeFirst(),
    ]);

    return {
      totalMessages: Number(total?.count ?? 0),
      inbound: Number(inbound?.count ?? 0),
      outbound: Number(outbound?.count ?? 0),
      pending: Number(pending?.count ?? 0),
      failed: Number(failed?.count ?? 0),
    };
  }

  /**
   * Get message stats for a specific date range (for dashboard charts)
   */
  async getStatsByDateRange(startDate: Date, endDate: Date): Promise<{
    total: number;
    delivered: number;
    pending: number;
    failed: number;
  }> {
    const baseQuery = this.db.selectFrom('messages')
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate);

    const [total, delivered, pending, failed] = await Promise.all([
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('deliveryStatus', '=', 'delivered')
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('deliveryStatus', 'in', ['queued', 'sent'])
        .executeTakeFirst(),
      baseQuery
        .select(({ fn }) => fn.count('id').as('count'))
        .where('deliveryStatus', 'in', ['failed', 'undelivered'])
        .executeTakeFirst(),
    ]);

    return {
      total: Number(total?.count ?? 0),
      delivered: Number(delivered?.count ?? 0),
      pending: Number(pending?.count ?? 0),
      failed: Number(failed?.count ?? 0),
    };
  }

  /**
   * Get daily message stats by delivery status for a date range
   */
  async getStatsByDay(startDate: Date, endDate: Date): Promise<{
    date: string;
    delivered: number;
    pending: number;
    failed: number;
  }[]> {
    const results = await this.db
      .selectFrom('messages')
      .select([
        sql<Date>`date_trunc('day', created_at)`.as('day'),
        sql<number>`count(*) filter (where delivery_status = 'delivered')`.as('delivered'),
        sql<number>`count(*) filter (where delivery_status in ('queued', 'sent'))`.as('pending'),
        sql<number>`count(*) filter (where delivery_status in ('failed', 'undelivered'))`.as('failed'),
      ])
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .groupBy(sql`date_trunc('day', created_at)`)
      .orderBy(sql`date_trunc('day', created_at)`, 'asc')
      .execute();

    return results.map((r) => ({
      date: new Date(r.day).toISOString().split('T')[0],
      delivered: Number(r.delivered ?? 0),
      pending: Number(r.pending ?? 0),
      failed: Number(r.failed ?? 0),
    }));
  }
}