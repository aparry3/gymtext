import { ConversationRepository } from '@/server/repositories/conversationRepository';
import { MessageRepository } from '@/server/repositories/messageRepository';
import type { Conversations, Messages, JsonValue } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { BaseMessage } from '@langchain/core/messages';

export type Conversation = Selectable<Conversations>;
export type NewConversation = Insertable<Conversations>;
export type ConversationUpdate = Updateable<Conversations>;

export type Message = Selectable<Messages>;
export type NewMessage = Insertable<Messages>;
export type MessageUpdate = Updateable<Messages>;

export interface ConversationContext {
  conversationId: string;
  summary?: string;
  recentMessages: RecentMessage[];
  userProfile: UserContextProfile;
  metadata: ConversationMetadata;
}

export interface RecentMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageId?: string;
}

export interface UserContextProfile {
  userId: string;
  fitnessGoals?: string;
  skillLevel?: string;
  currentProgram?: string;
  recentTopics?: string[];
  preferences?: Record<string, unknown>;
  lastWorkoutDate?: Date;
}

export interface ConversationMetadata {
  startTime: Date;
  messageCount: number;
  lastInteractionTime: Date;
  isNewConversation: boolean;
  conversationGapMinutes: number;
}

export interface CachedContext {
  context: ConversationContext;
  formattedMessages?: BaseMessage[];
  tokenCount?: number;
  timestamp: number;
  ttl: number;
}

export interface TokenUsage {
  contextTokens: number;
  systemMessageTokens: number;
  messageHistoryTokens: number;
  totalTokens: number;
}

export interface ContextRetrievalOptions {
  includeWorkoutHistory?: boolean;
  includeUserProfile?: boolean;
  messageLimit?: number;
  skipCache?: boolean;
}

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
    
    const now = new Date();
    const conversation = await this.conversationRepository.create({
      userId,
      startedAt: now,
      lastMessageAt: now
    });
    
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
      userId: conversation.userId,
      content,
      direction: role === 'user' ? 'inbound' : 'outbound',
      phoneFrom: '', // These would be filled in by the actual SMS service
      phoneTo: ''    // These would be filled in by the actual SMS service
    });
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.findByConversationId(conversationId);
  }

  async updateConversationMetadata(id: string, metadata: Record<string, unknown>): Promise<Conversation> {
    // Business logic for metadata updates
    this.validateMetadata(metadata);
    
    return await this.conversationRepository.update(id, {
      metadata: metadata as JsonValue
    });
  }

  async deleteConversation(id: string): Promise<void> {
    // Business logic - ensure user owns conversation, etc.
    const conversation = await this.conversationRepository.findById(id);
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    // Delete conversation - messages should be handled by cascade or separate cleanup
    await this.conversationRepository.update(id, { status: 'deleted' });
    // Note: Actual deletion logic would depend on your data retention policy
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

  private validateMetadata(metadata: Record<string, unknown>): void {
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