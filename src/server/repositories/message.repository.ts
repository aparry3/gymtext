import { BaseRepository } from './base.repository';
import { MessagesTable } from '@/shared/types/schema';
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
      .where('conversation_id', '=', conversationId)
      .orderBy('created_at', 'asc')
      .execute();
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Message[]> {
    return await this.db
      .selectFrom('messages')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .execute();
  }

  async countByConversationId(conversationId: string): Promise<number> {
    const result = await this.db
      .selectFrom('messages')
      .select(({ fn }) => fn.count('id').as('count'))
      .where('conversation_id', '=', conversationId)
      .executeTakeFirst();
    
    return Number(result?.count ?? 0);
  }
}