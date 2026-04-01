/**
 * Environment Context
 *
 * This module provides the environment context system.
 * Apps provide their own secrets and config - this module is environment-agnostic.
 */

// Types
export type {
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
} from './types';

// Context creation
export { createEnvContext, clearContextCache } from './createEnvContext';
