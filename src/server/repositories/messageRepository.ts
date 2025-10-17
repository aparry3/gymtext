import { BaseRepository } from '@/server/repositories/baseRepository';
import type { 
  Message, 
  NewMessage, 
} from '@/server/models/messageModel';

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

  async findByConversationId(conversationId: string): Promise<Message[]> {
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('conversationId', '=', conversationId)
      .orderBy('createdAt', 'asc')
      .execute();
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Message[]> {
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .execute();
  }

  async countByConversationId(conversationId: string): Promise<number> {
    const result = await this.db
      .selectFrom('messages')
      .select(({ fn }) => fn.count('id').as('count'))
      .where('conversationId', '=', conversationId)
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
}