import { BaseMessage } from '@langchain/core/messages';

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