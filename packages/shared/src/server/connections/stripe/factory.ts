/**
 * Stripe Client Factory
 *
 * Creates Stripe client instances on-demand. Supports multiple
 * API keys for environment switching (sandbox/production).
 */
import Stripe from 'stripe';

/**
 * Stripe credentials configuration
 */
export interface StripeCredentials {
  secretKey: string;
  webhookSecret: string;
}

// Cache clients by secret key prefix (to identify environment)
const clientCache = new Map<string, Stripe>();

/**
 * Create or retrieve a cached Stripe client
 * @param credentials - Stripe API credentials
 * @returns Stripe instance
 */
export function createStripeClient(credentials: StripeCredentials): Stripe {
  // Use a hash/prefix of the secret key as cache key (for security, don't use full key)
  const cacheKey = credentials.secretKey.substring(0, 20);

  // Return cached instance if available
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey)!;
  }

  const client = new Stripe(credentials.secretKey, {
    apiVersion: '2023-10-16',
  });

  clientCache.set(cacheKey, client);
  return client;
}

/**
 * Get the webhook secret for signature verification
 * This is a simple passthrough but maintains consistency with factory pattern
 */
export function getWebhookSecret(credentials: StripeCredentials): string {
  return credentials.webhookSecret;
}

/**
 * Clear all cached Stripe clients
 */
export function clearStripeClients(): void {
  clientCache.clear();
}
