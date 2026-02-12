/**
 * Admin App Secrets Loader
 *
 * Centralizes all credential/secret environment variable access for the admin app.
 * Supports environment switching between production and sandbox.
 *
 * Secrets vs Config:
 * - Secrets (this file): Sensitive credentials (API keys, database passwords, auth tokens)
 * - Config (config.ts): Non-sensitive settings (URLs, feature flags)
 */

import { z } from 'zod';

export type EnvironmentMode = 'production' | 'sandbox';

// =============================================================================
// Schema
// =============================================================================

const SecretsSchema = z.object({
  // Production - Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Production - Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_NUMBER: z.string().min(1, 'TWILIO_NUMBER is required'),

  // Production - Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Sandbox - Database (optional, falls back to production)
  SANDBOX_DATABASE_URL: z.string().optional(),

  // Sandbox - Twilio (optional, falls back to production)
  SANDBOX_TWILIO_ACCOUNT_SID: z.string().optional(),
  SANDBOX_TWILIO_AUTH_TOKEN: z.string().optional(),
  SANDBOX_TWILIO_NUMBER: z.string().optional(),

  // Sandbox - Stripe (optional, falls back to production)
  SANDBOX_STRIPE_SECRET_KEY: z.string().optional(),
  SANDBOX_STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Shared - AI Services (same for all environments)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  XAI_API_KEY: z.string().optional(),

  // Shared - Pinecone (same for all environments)
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX: z.string().min(1, 'PINECONE_INDEX is required'),

  // Background Jobs
  CRON_SECRET: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

type EnvVars = z.infer<typeof SecretsSchema>;

// =============================================================================
// Types
// =============================================================================

export interface SecretsConfig {
  database: {
    url: string;
  };
  twilio: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  ai: {
    openaiApiKey: string;
    googleApiKey: string;
    xaiApiKey?: string;
  };
  pinecone: {
    apiKey: string;
    indexName: string;
  };
  cron: {
    cronSecret?: string;
    inngestEventKey?: string;
    inngestSigningKey?: string;
  };
}

// =============================================================================
// Loader
// =============================================================================

let _env: EnvVars | null = null;

function getEnv(): EnvVars {
  if (_env) return _env;

  const result = SecretsSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Admin app secrets validation failed:\n${errors}\n\n` +
        `Ensure all required environment variables are set.`
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Get production secrets.
 */
export function getProductionSecrets(): SecretsConfig {
  const env = getEnv();

  return {
    database: {
      url: env.DATABASE_URL,
    },
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_NUMBER,
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET ?? '',
    },
    ai: {
      openaiApiKey: env.OPENAI_API_KEY,
      googleApiKey: env.GOOGLE_API_KEY,
      xaiApiKey: env.XAI_API_KEY,
    },
    pinecone: {
      apiKey: env.PINECONE_API_KEY,
      indexName: env.PINECONE_INDEX,
    },
    cron: {
      cronSecret: env.CRON_SECRET,
      inngestEventKey: env.INNGEST_EVENT_KEY,
      inngestSigningKey: env.INNGEST_SIGNING_KEY,
    },
  };
}

/**
 * Get sandbox secrets.
 * Falls back to production for any unset sandbox variables.
 */
export function getSandboxSecrets(): SecretsConfig {
  const env = getEnv();
  const prod = getProductionSecrets();

  return {
    database: {
      url: env.SANDBOX_DATABASE_URL || prod.database.url,
    },
    twilio: {
      accountSid: env.SANDBOX_TWILIO_ACCOUNT_SID || prod.twilio.accountSid,
      authToken: env.SANDBOX_TWILIO_AUTH_TOKEN || prod.twilio.authToken,
      phoneNumber: env.SANDBOX_TWILIO_NUMBER || prod.twilio.phoneNumber,
    },
    stripe: {
      secretKey: env.SANDBOX_STRIPE_SECRET_KEY || prod.stripe.secretKey,
      webhookSecret: env.SANDBOX_STRIPE_WEBHOOK_SECRET || prod.stripe.webhookSecret,
    },
    // AI and Pinecone are shared across environments
    ai: prod.ai,
    pinecone: prod.pinecone,
    cron: prod.cron,
  };
}

/**
 * Get secrets for a specific environment mode.
 */
export function getSecretsForMode(mode: EnvironmentMode): SecretsConfig {
  return mode === 'sandbox' ? getSandboxSecrets() : getProductionSecrets();
}

/**
 * Reset secrets cache (for testing).
 */
export function resetSecrets(): void {
  _env = null;
}
