import { BaseRepository } from './base.repository';
import { Messages } from '@/shared/types/schema';
import { Insertable, Selectable } from 'kysely';

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;

export class MessageRepository extends BaseRepository {
  async create(message: NewMessage): Promise<Message> {
    return await this.db
      .insertInto('messages')
      .values(message)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<Message | null> {
    const result = await this.db
      .selectFrom('messages')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    return result || null;
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

  async getRecentMessages(
    conversationId: string,
    limit: number = 5
  ): Promise<Message[]> {
    const messages = await this.db
      .selectFrom('messages')
      .where('conversationId', '=', conversationId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    // Reverse to get chronological order
    return messages.reverse();
  }

  async getRecentMessagesForUser(
    userId: string,
    limit: number = 10
  ): Promise<Message[]> {
    const messages = await this.db
      .selectFrom('messages')
      .where('userId', '=', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .selectAll()
      .execute();

    return messages.reverse();
  }

  async getAllConversationMessages(
    conversationId: string
  ): Promise<Message[]> {
    return await this.db
      .selectFrom('messages')
      .where('conversationId', '=', conversationId)
      .orderBy('createdAt', 'asc')
      .selectAll()
      .execute();
  }

  async update(id: string, update: Partial<NewMessage>): Promise<Message | null> {
    const result = await this.db
      .updateTable('messages')
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async delete(id: string): Promise<Message | null> {
    const result = await this.db
      .deleteFrom('messages')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    
    return result || null;
  }
}