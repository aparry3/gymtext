/**
 * Web App Secrets Loader
 *
 * Centralizes all credential/secret environment variable access for the web app.
 * This app always uses production credentials.
 *
 * Secrets vs Config:
 * - Secrets (this file): Sensitive credentials (API keys, database passwords, auth tokens)
 * - Config (config.ts): Non-sensitive settings (URLs, feature flags)
 */

import { z } from 'zod';

// =============================================================================
// Schema
// =============================================================================

const SecretsSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_NUMBER: z.string().min(1, 'TWILIO_NUMBER is required'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // AI Services
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  XAI_API_KEY: z.string().optional(),

  // Pinecone
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX: z.string().min(1, 'PINECONE_INDEX is required'),

  // Background Jobs
  CRON_SECRET: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Session
  SESSION_ENCRYPTION_KEY: z.string().optional(),

  // Blob Storage
  BLOB_READ_WRITE_TOKEN: z.string().optional(),
});

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
  session: {
    encryptionKey?: string;
  };
}

// =============================================================================
// Loader
// =============================================================================

let _secrets: SecretsConfig | null = null;

function loadSecrets(): SecretsConfig {
  const result = SecretsSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Web app secrets validation failed:\n${errors}\n\n` +
        `Ensure all required environment variables are set.`
    );
  }

  const env = result.data;

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
    session: {
      encryptionKey: env.SESSION_ENCRYPTION_KEY,
    },
  };
}

/**
 * Get validated secrets for the web app.
 * Caches the result for subsequent calls.
 */
export function getSecrets(): SecretsConfig {
  if (!_secrets) {
    _secrets = loadSecrets();
  }
  return _secrets;
}

/**
 * Reset secrets cache (for testing).
 */
export function resetSecrets(): void {
  _secrets = null;
}
