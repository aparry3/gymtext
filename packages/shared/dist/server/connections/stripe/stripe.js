/**
 * Stripe Connection
 *
 * This module provides the default Stripe client using environment
 * variables. For environment switching (sandbox/production), use
 * the factory functions instead.
 */
import { getStripeSecrets } from '@/server/config';
import { createStripeClient } from './factory';
// Get credentials from validated server config
const { secretKey, webhookSecret } = getStripeSecrets();
// Create default Stripe client using factory
export const stripeClient = createStripeClient({
    secretKey,
    webhookSecret,
});
// Export the webhook secret for convenience
export { webhookSecret };
// Re-export factory functions and types for environment switching
export { createStripeClient, getWebhookSecret, clearStripeClients, } from './factory';
