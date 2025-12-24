import type { AppConfig } from '../schema';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Staging environment overrides.
 */
export const stagingConfig: DeepPartial<AppConfig> = {
  environment: 'staging',
  features: {
    agentLogging: true,
  },
};
