/**
 * Admin Stripe Client
 *
 * Creates a Stripe client for the current environment mode.
 * Used by admin API routes that need direct Stripe access.
 */

import Stripe from 'stripe';
import { getSecretsForMode, type EnvironmentMode } from './secrets';

const stripeCache = new Map<string, Stripe>();

export function getStripeClient(mode: EnvironmentMode): Stripe {
  const secrets = getSecretsForMode(mode);
  const key = secrets.stripe.secretKey;

  if (!stripeCache.has(key)) {
    stripeCache.set(key, new Stripe(key, { apiVersion: '2023-10-16' }));
  }

  return stripeCache.get(key)!;
}
