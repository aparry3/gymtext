/**
 * Environment Context
 *
 * This module provides the environment context system that enables
 * switching between sandbox and production environments in the admin app.
 */

// Types
export type {
  EnvironmentMode,
  EnvironmentContext,
  EnvironmentSecrets,
  EnvironmentSecretsConfig,
  DatabaseSecrets,
  TwilioSecrets,
  StripeSecrets,
  AISecrets,
  PineconeSecrets,
} from './types';

// Context creation
export {
  createEnvContext,
  createProductionContext,
  clearContextCache,
  isSandboxConfigured,
} from './createEnvContext';
