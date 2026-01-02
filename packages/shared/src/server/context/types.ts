/**
 * Environment Context Types
 *
 * These types define the context object that carries environment-specific
 * configuration through the request lifecycle. This enables the admin
 * dashboard to switch between sandbox and production environments.
 */
import type { Kysely } from 'kysely';
import type Stripe from 'stripe';
import type { DB } from '@/server/models/_types';
import type { ITwilioClient } from '../connections/twilio/factory';

/**
 * Environment mode - sandbox or production
 */
export type EnvironmentMode = 'production' | 'sandbox';

/**
 * Database credentials for a specific environment
 */
export interface DatabaseSecrets {
  url: string;
}

/**
 * Twilio credentials for a specific environment
 */
export interface TwilioSecrets {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

/**
 * Stripe credentials for a specific environment
 */
export interface StripeSecrets {
  secretKey: string;
  webhookSecret: string;
}

/**
 * AI service credentials (shared across environments)
 */
export interface AISecrets {
  openaiApiKey: string;
  googleApiKey: string;
}

/**
 * Pinecone credentials (shared across environments)
 */
export interface PineconeSecrets {
  apiKey: string;
  indexName: string;
}

/**
 * All secrets for a specific environment
 */
export interface EnvironmentSecrets {
  database: DatabaseSecrets;
  twilio: TwilioSecrets;
  stripe: StripeSecrets;
  // Shared across environments
  ai: AISecrets;
  pinecone: PineconeSecrets;
}

/**
 * Environment context - carries all environment-specific resources
 * through the request lifecycle
 */
export interface EnvironmentContext {
  /** Current environment mode */
  mode: EnvironmentMode;

  /** All secrets for this environment */
  secrets: EnvironmentSecrets;

  /** Pre-initialized database connection */
  db: Kysely<DB>;

  /** Pre-initialized Twilio client */
  twilioClient: ITwilioClient;

  /** Pre-initialized Stripe client */
  stripeClient: Stripe;
}

/**
 * Configuration for loading environment secrets
 */
export interface EnvironmentSecretsConfig {
  production: {
    database: DatabaseSecrets;
    twilio: TwilioSecrets;
    stripe: StripeSecrets;
  };
  sandbox: {
    database: DatabaseSecrets;
    twilio: TwilioSecrets;
    stripe: StripeSecrets;
  };
  shared: {
    ai: AISecrets;
    pinecone: PineconeSecrets;
  };
}
