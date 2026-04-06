/**
 * Admin Stripe Client
 *
 * Creates a Stripe client for use in admin API routes.
 */

import Stripe from 'stripe';
import { getSecrets } from './secrets';

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!cachedClient) {
    const secrets = getSecrets();
    cachedClient = new Stripe(secrets.stripe.secretKey, { apiVersion: '2023-10-16' });
  }
  return cachedClient;
}
