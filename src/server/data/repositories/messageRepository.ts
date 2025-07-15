import { BaseRepository } from './baseRepository';
import { MessagesTable } from '@/shared/types/database';
import { Insertable, Selectable } from 'kysely';

export type Message = Selectable<MessagesTable>;
export type NewMessage = Insertable<MessagesTable>;

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
}