import { Conversation, NewConversation, ConversationUpdate } from './_types';

// Re-export Kysely generated types
export type { Conversation, NewConversation, ConversationUpdate };

// Additional conversation types
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  messageCount: number;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  createdAt: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  tokensUsed?: number;
  model?: string;
  processingTime?: number;
  error?: string;
}

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  lastMessageAt: Date;
  messageCount: number;
  status: 'active' | 'archived';
}

// Helper functions
export const generateConversationTitle = (firstMessage: string): string => {
  // Generate a title from the first message
  const maxLength = 50;
  const title = firstMessage.length > maxLength 
    ? firstMessage.substring(0, maxLength) + '...' 
    : firstMessage;
  return title.replace(/\n/g, ' ').trim();
};