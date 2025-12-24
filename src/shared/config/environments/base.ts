import type { AppConfig } from '../schema';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Base configuration with sensible defaults.
 * Environment-specific configs override these values.
 */
export const baseConfig: DeepPartial<AppConfig> = {
  context: {
    messageHistoryLimit: 5,
    includeSystemMessages: true,
    maxContextTokens: 1000,
    reserveTokensForResponse: 1500,
    conversationGapMinutes: 30,
    enableCaching: true,
    cacheTTLSeconds: 300,
  },
  chat: {
    smsMaxLength: 1600,
    contextMinutes: 10,
  },
  messaging: {
    provider: 'twilio',
  },
  features: {
    agentLogging: false,
    enableConversationStorage: true,
  },
  conversation: {
    timeoutMinutes: 30,
    maxLength: 100,
    inactiveThresholdDays: 7,
  },
  shortLinks: {
    defaultExpiryDays: 7,
  },
  admin: {
    phoneNumbers: [],
    maxRequestsPerWindow: 3,
    rateLimitWindowMinutes: 15,
    codeExpiryMinutes: 10,
    codeLength: 6,
  },
  urls: {},
};
