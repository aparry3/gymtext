/**
 * Stripe Connection
 *
 * This module provides the default Stripe client using environment
 * variables. For environment switching (sandbox/production), use
 * the factory functions instead.
 */
import { getStripeSecrets } from '@/server/config';
import { getStripeConfig } from '@/shared/config';
import { createStripeClient, type StripeCredentials } from './factory';

// Get credentials from validated server config
const { secretKey, webhookSecret } = getStripeSecrets();

// Create default Stripe client using factory
export const stripeClient = createStripeClient({
  secretKey,
  webhookSecret,
});

// Export the webhook secret for convenience
export { webhookSecret };

// ── Price lookup with default fallback ──────────────────────────────
const priceCache = new Map<string, number | null>();

/**
 * Fetch price amount in cents from Stripe.
 * Falls back to the platform default STRIPE_PRICE_ID when no priceId is provided.
 */
export async function fetchPriceAmountCents(priceId?: string | null): Promise<number | null> {
  const resolvedId = priceId || getStripeConfig().priceId;
  if (!resolvedId) return null;
  if (priceCache.has(resolvedId)) return priceCache.get(resolvedId)!;
  try {
    const price = await stripeClient.prices.retrieve(resolvedId);
    const amount = price.unit_amount ?? null;
    priceCache.set(resolvedId, amount);
    return amount;
  } catch {
    priceCache.set(resolvedId, null);
    return null;
  }
}

// Re-export factory functions and types for environment switching
export {
  createStripeClient,
  getWebhookSecret,
  clearStripeClients,
  type StripeCredentials,
} from './factory';
