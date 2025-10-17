import { MessageRepository } from '@/server/repositories/messageRepository';
import type { Messages } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

export class MessageModel {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async createMessage(messageData: NewMessage): Promise<Message> {
    // Business logic validation
    this.validateMessageData(messageData);
    
    return await this.messageRepository.create(messageData);
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    return await this.messageRepository.findById(id);
  }

  async getMessagesByUser(userId: string, limit?: number): Promise<Message[]> {
    return await this.messageRepository.findByUserId(userId, limit);
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    // Business logic for updates
    if (updates.content) {
      this.validateMessageContent(updates.content);
    }
    
    // TODO: Implement update in repository when needed
    throw new Error('Message updates not yet implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async deleteMessage(_id: string): Promise<void> {
    // TODO: Implement delete in repository when needed
    throw new Error('Message deletion not yet implemented');
  }

  private validateMessageData(data: NewMessage): void {
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.direction || !['inbound', 'outbound'].includes(data.direction)) {
      throw new Error('Direction must be either "inbound" or "outbound"');
    }

    if (!data.content) {
      throw new Error('Message content is required');
    }

    this.validateMessageContent(data.content);
  }

  private validateMessageContent(content: string): void {
    if (content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    
    if (content.length > 10000) {
      throw new Error('Message content cannot exceed 10,000 characters');
    }
  }
}