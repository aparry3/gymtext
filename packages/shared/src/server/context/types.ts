/**
 * Environment Context Types
 *
 * These types define the context object that carries environment-specific
 * configuration through the request lifecycle.
 */
import type { Kysely } from 'kysely';
import type Stripe from 'stripe';
import type { DB } from '@/server/models/_types';
import type { ITwilioClient } from '../connections/twilio/factory';

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
  messagingServiceSid: string;
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
  openrouterApiKey?: string;
}

/**
 * Pinecone credentials (shared across environments)
 */
export interface PineconeSecrets {
  apiKey: string;
  indexName: string;
}

/**
 * Cron/background job credentials
 */
export interface CronSecrets {
  cronSecret?: string;
  inngestEventKey?: string;
  inngestSigningKey?: string;
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
  cron: CronSecrets;
}

/**
 * Environment-agnostic secrets configuration.
 * Apps load their own env vars and pass this to the shared package.
 * The shared package doesn't know about app-level naming conventions.
 */
export interface SecretsConfig {
  database: DatabaseSecrets;
  twilio: TwilioSecrets;
  stripe: StripeSecrets;
  ai: AISecrets;
  pinecone: PineconeSecrets;
  cron: CronSecrets;
}

/**
 * Environment-agnostic config (non-secrets).
 * For settings like URLs that vary by environment but aren't sensitive.
 */
export interface EnvConfig {
  /** Base URL for the web API (used for callbacks, etc.) */
  webApiBaseUrl?: string;
}

/**
 * Environment context - carries all environment-specific resources
 * through the request lifecycle
 */
export interface EnvironmentContext {
  /** All secrets for this environment */
  secrets: EnvironmentSecrets;

  /** Pre-initialized database connection */
  db: Kysely<DB>;

  /** Pre-initialized Twilio client */
  twilioClient: ITwilioClient;

  /** Pre-initialized Stripe client */
  stripeClient: Stripe;
}

