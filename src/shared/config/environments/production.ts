import type { AppConfig } from '../schema';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Production environment overrides.
 */
export const productionConfig: DeepPartial<AppConfig> = {
  environment: 'production',
  features: {
    agentLogging: false,
  },
  context: {
    cacheTTLSeconds: 600,
  },
};
