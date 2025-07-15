import { BaseRepository } from './baseRepository';
import { ConversationsTable } from '@/shared/types/database';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Conversation = Selectable<ConversationsTable>;
export type NewConversation = Insertable<ConversationsTable>;
export type ConversationUpdate = Updateable<ConversationsTable>;

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
      .where('user_id', '=', userId)
      .orderBy('last_message_at', 'desc')
      .execute();
  }

  async findActiveByUserId(userId: string): Promise<Conversation | undefined> {
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('user_id', '=', userId)
      .where('status', '=', 'active')
      .orderBy('last_message_at', 'desc')
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
    return await this.db
      .selectFrom('conversations')
      .selectAll()
      .where('user_id', '=', userId)
      .orderBy('last_message_at', 'desc')
      .executeTakeFirst();
  }
}