import type { AppConfig } from '../schema';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Development environment overrides.
 */
export const developmentConfig: DeepPartial<AppConfig> = {
  environment: 'development',
  features: {
    agentLogging: true,
  },
  messaging: {
    provider: 'local',
  },
  admin: {
    devBypassCode: '000000',
  },
};
