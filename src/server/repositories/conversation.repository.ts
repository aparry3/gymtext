import { BaseRepository } from './base.repository';
import { Conversations } from '@/shared/types/schema';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Conversation = Selectable<Conversations>;
export type NewConversation = Insertable<Conversations>;
export type ConversationUpdate = Updateable<Conversations>;

export class ConversationRepository extends BaseRepository {
  async create(conversation: NewConversation): Promise<Conversation> {
    return await this.db
      .insertInto('conversations')
      .values(conversation)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findById(id: string): Promise<Conversation | null> {
    const result = await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    return result || null;
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('lastMessageAt', 'desc')
      .execute();
  }

  async findActiveByUserId(userId: string): Promise<Conversation | null> {
    const result = await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .orderBy('lastMessageAt', 'desc')
      .executeTakeFirst();
    
    return result || null;
  }

  async update(id: string, update: ConversationUpdate): Promise<Conversation> {
    return await this.db
      .updateTable('conversations')
      .set(update)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async markAsInactive(id: string): Promise<Conversation> {
    return await this.update(id, { status: 'inactive' });
  }

  async getLastConversationForUser(userId: string): Promise<Conversation | null> {
    const result = await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('lastMessageAt', 'desc')
      .executeTakeFirst();
    
    return result || null;
  }

  async delete(id: string): Promise<Conversation | null> {
    const result = await this.db
      .deleteFrom('conversations')
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();
    
    return result || null;
  }

  async getActiveConversation(
    userId: string,
    conversationGapMinutes: number = 30
  ): Promise<Conversation | null> {
    const cutoffTime = new Date(Date.now() - conversationGapMinutes * 60 * 1000);
    
    const conversation = await this.db
      .selectFrom('conversations')
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .where('lastMessageAt', '>=', cutoffTime)
      .orderBy('lastMessageAt', 'desc')
      .selectAll()
      .executeTakeFirst();

    return conversation || null;
  }

  async getMessageCount(conversationId: string): Promise<number> {
    const result = await this.db
      .selectFrom('messages')
      .where('conversationId', '=', conversationId)
      .select(this.db.fn.count('id').as('count'))
      .executeTakeFirst();

    return Number(result?.count || 0);
  }

  async getConversationTopics(conversationId: string): Promise<string[]> {
    const topics = await this.db
      .selectFrom('conversationTopics')
      .where('conversationId', '=', conversationId)
      .orderBy('confidence', 'desc')
      .select('topic')
      .execute();

    return topics.map(t => t.topic);
  }
}