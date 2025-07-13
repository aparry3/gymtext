export interface ContextConfig {
  messageHistoryLimit: number;        // Number of previous messages to include
  includeSystemMessages: boolean;     // Whether to include system messages in context
  maxContextTokens: number;          // Maximum tokens for context
  reserveTokensForResponse: number;  // Tokens to reserve for AI response
  conversationGapMinutes: number;    // Minutes before starting new conversation
  enableCaching: boolean;            // Whether to enable context caching
  cacheTTLSeconds: number;          // Cache time-to-live in seconds
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  messageHistoryLimit: 5,
  includeSystemMessages: true,
  maxContextTokens: 1000,
  reserveTokensForResponse: 1500,
  conversationGapMinutes: 30,
  enableCaching: true,
  cacheTTLSeconds: 300, // 5 minutes
};

export function getContextConfig(): ContextConfig {
  return {
    messageHistoryLimit: parseInt(process.env.CONTEXT_MESSAGE_HISTORY_LIMIT || '5'),
    includeSystemMessages: process.env.CONTEXT_INCLUDE_SYSTEM_MESSAGES !== 'false',
    maxContextTokens: parseInt(process.env.CONTEXT_MAX_TOKENS || '1000'),
    reserveTokensForResponse: parseInt(process.env.CONTEXT_RESERVE_TOKENS || '1500'),
    conversationGapMinutes: parseInt(process.env.CONTEXT_CONVERSATION_GAP_MINUTES || '30'),
    enableCaching: process.env.CONTEXT_ENABLE_CACHING !== 'false',
    cacheTTLSeconds: parseInt(process.env.CONTEXT_CACHE_TTL || '300'),
  };
}