import { MessageRepository } from '../repositories/messageRepository';
import type { Message } from './_types';

export class MessageModel {
  private messageRepository: MessageRepository;

  constructor() {
    this.messageRepository = new MessageRepository();
  }

  async createMessage(messageData: Partial<Message>): Promise<Message> {
    // Business logic validation
    this.validateMessageData(messageData);
    
    return await this.messageRepository.create(messageData);
  }

  async getMessageById(id: string): Promise<Message | undefined> {
    return await this.messageRepository.findById(id);
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.findByConversationId(conversationId);
  }

  async updateMessage(id: string, updates: Partial<Message>): Promise<Message> {
    // Business logic for updates
    if (updates.content) {
      this.validateMessageContent(updates.content);
    }
    
    return await this.messageRepository.update(id, updates);
  }

  async deleteMessage(id: string): Promise<void> {
    return await this.messageRepository.delete(id);
  }

  private validateMessageData(data: Partial<Message>): void {
    if (!data.conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    if (!data.role || !['user', 'assistant'].includes(data.role)) {
      throw new Error('Role must be either "user" or "assistant"');
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