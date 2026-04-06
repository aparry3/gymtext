/**
 * Environment Context Factory
 *
 * Creates environment-specific context objects for request handling.
 * Apps provide their own secrets and config - this module is environment-agnostic.
 *
 * @example
 * // In an API route
 * import { getSecrets } from '@/lib/secrets';
 * import { getConfig } from '@/lib/config';
 *
 * const ctx = await createEnvContext(getSecrets(), { webApiBaseUrl: getConfig().urls.baseUrl });
 */
import type {
  EnvironmentContext,
  SecretsConfig,
  EnvConfig,
  EnvironmentSecrets,
} from './types';
import { createDatabase } from '../connections/postgres/factory';
import { createTwilioClient } from '../connections/twilio/factory';
import { createStripeClient } from '../connections/stripe/factory';

// Cache contexts by database URL (since that's the primary differentiator)
const contextCache = new Map<string, EnvironmentContext>();

/**
 * Create an environment context from provided secrets and config.
 *
 * The shared package is environment-agnostic - it receives secrets from the app
 * and doesn't know about environment naming conventions.
 *
 * @param secrets - Credentials for database, Twilio, Stripe, AI, Pinecone, cron
 * @param config - Non-secret config like URLs
 * @returns EnvironmentContext for the specified environment
 */
export async function createEnvContext(
  secrets: SecretsConfig,
  config?: EnvConfig,
): Promise<EnvironmentContext> {
  const cacheKey = secrets.database.url;

  // Return cached context if available for this database URL
  if (contextCache.has(cacheKey)) {
    return contextCache.get(cacheKey)!;
  }

  // Build status callback URL from config
  const statusCallbackUrl = config?.webApiBaseUrl
    ? `${config.webApiBaseUrl}/api/twilio/status`
    : undefined;

  // Build secrets object for context
  const environmentSecrets: EnvironmentSecrets = {
    database: secrets.database,
    twilio: secrets.twilio,
    stripe: secrets.stripe,
    ai: secrets.ai,
    pinecone: secrets.pinecone,
    cron: secrets.cron,
  };

  // Create context with initialized connections
  const context: EnvironmentContext = {
    secrets: environmentSecrets,
    db: createDatabase(secrets.database.url),
    twilioClient: createTwilioClient(secrets.twilio, statusCallbackUrl),
    stripeClient: createStripeClient(secrets.stripe),
  };

  // Cache for reuse
  contextCache.set(cacheKey, context);
  return context;
}

/**
 * Clear the context cache (for testing)
 */
export function clearContextCache(): void {
  contextCache.clear();
}
