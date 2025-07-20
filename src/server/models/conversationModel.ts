import { ConversationRepository } from '../repositories/conversationRepository';
import { MessageRepository } from '../repositories/messageRepository';
import type { Conversation, Message } from './_types';

export class ConversationModel {
  private conversationRepository: ConversationRepository;
  private messageRepository: MessageRepository;

  constructor() {
    this.conversationRepository = new ConversationRepository();
    this.messageRepository = new MessageRepository();
  }

  async createConversation(userId: string, initialMessage?: string): Promise<Conversation> {
    // Business logic for conversation creation
    this.validateUserId(userId);
    
    const conversation = await this.conversationRepository.create(userId);
    
    if (initialMessage) {
      await this.addMessage(conversation.id, 'user', initialMessage);
    }
    
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return await this.conversationRepository.findById(id);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    this.validateUserId(userId);
    return await this.conversationRepository.findByUserId(userId);
  }

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<Message> {
    // Business logic for message creation
    this.validateMessageContent(content);
    this.validateRole(role);
    
    // Verify conversation exists
    const conversation = await this.conversationRepository.findById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    return await this.messageRepository.create({
      conversationId,
      role,
      content,
    });
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.findByConversationId(conversationId);
  }

  async updateConversationMetadata(id: string, metadata: Record<string, any>): Promise<Conversation> {
    // Business logic for metadata updates
    this.validateMetadata(metadata);
    
    return await this.conversationRepository.updateMetadata(id, metadata);
  }

  async deleteConversation(id: string): Promise<void> {
    // Business logic - ensure user owns conversation, etc.
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Delete all messages first
    await this.messageRepository.deleteByConversationId(id);
    
    // Then delete conversation
    return await this.conversationRepository.delete(id);
  }

  private validateUserId(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }

  private validateMessageContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
    
    if (content.length > 10000) {
      throw new Error('Message content cannot exceed 10,000 characters');
    }
  }

  private validateRole(role: string): void {
    if (!['user', 'assistant'].includes(role)) {
      throw new Error('Role must be either "user" or "assistant"');
    }
  }

  private validateMetadata(metadata: Record<string, any>): void {
    if (!metadata || typeof metadata !== 'object') {
      throw new Error('Metadata must be a valid object');
    }
    
    // Check for reasonable size limits
    const metadataString = JSON.stringify(metadata);
    if (metadataString.length > 50000) {
      throw new Error('Metadata size cannot exceed 50KB');
    }
  }
}