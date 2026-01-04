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
/**
 * Create or retrieve a cached Stripe client
 * @param credentials - Stripe API credentials
 * @returns Stripe instance
 */
export declare function createStripeClient(credentials: StripeCredentials): Stripe;
/**
 * Get the webhook secret for signature verification
 * This is a simple passthrough but maintains consistency with factory pattern
 */
export declare function getWebhookSecret(credentials: StripeCredentials): string;
/**
 * Clear all cached Stripe clients
 */
export declare function clearStripeClients(): void;
//# sourceMappingURL=factory.d.ts.map