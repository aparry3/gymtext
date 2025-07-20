import { Message, NewMessage, MessageUpdate } from './_types';

// Re-export Kysely generated types
export type { Message, NewMessage, MessageUpdate };

// Additional message types
export interface MessageWithContext extends Message {
  conversation?: {
    id: string;
    userId: string;
    title: string;
  };
  previousMessage?: Message;
  nextMessage?: Message;
}

export interface MessageThread {
  messages: Message[];
  conversationId: string;
  userId: string;
  startedAt: Date;
  lastMessageAt: Date;
  totalTokens: number;
}

export interface MessageAnalytics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageResponseTime: number;
  totalTokensUsed: number;
}

// Message type guards
export const isUserMessage = (message: Message): boolean => {
  return message.role === 'user';
};

export const isAssistantMessage = (message: Message): boolean => {
  return message.role === 'assistant';
};

// Helper functions
export const calculateTokenUsage = (messages: Message[]): number => {
  return messages.reduce((total, msg) => {
    return total + (msg.metadata?.tokensUsed || 0);
  }, 0);
};