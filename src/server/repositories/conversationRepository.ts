import { BaseRepository } from './baseRepository';
import type { Conversations } from '@/server/models/_types';
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

  async findById(id: string): Promise<Conversation | undefined> {
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
  }

  async findByUserId(userId: string): Promise<Conversation[]> {
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('lastMessageAt', 'desc')
      .execute();
  }

  async findActiveByUserId(userId: string): Promise<Conversation | undefined> {
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .where('status', '=', 'active')
      .orderBy('lastMessageAt', 'desc')
      .executeTakeFirst();
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

  async getLastConversationForUser(userId: string): Promise<Conversation | undefined> {
    console.log('userId', userId);
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('userId', '=', userId)
      .orderBy('lastMessageAt', 'desc')
      .executeTakeFirst();
  }
}