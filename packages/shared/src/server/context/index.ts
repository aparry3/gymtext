/**
 * Environment Context
 *
 * This module provides the environment context system.
 * Apps provide their own secrets and config - this module is environment-agnostic.
 */

// Types
export type {
  EnvironmentMode,
  EnvironmentContext,
  EnvironmentSecrets,
  DatabaseSecrets,
  TwilioSecrets,
  StripeSecrets,
  AISecrets,
  PineconeSecrets,
  CronSecrets,
  SecretsConfig,
  EnvConfig,
  // Deprecated - kept for backward compatibility
  EnvironmentSecretsConfig,
} from './types';

// Context creation
export { createEnvContext, clearContextCache } from './createEnvContext';
export type { CreateEnvContextOptions } from './createEnvContext';
