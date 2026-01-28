/**
 * Programs App Secrets Loader
 *
 * Centralizes all credential/secret environment variable access for the programs app.
 * Programs app always uses production credentials (no environment switching).
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

  // AI Services (for program parsing)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
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
  ai: {
    openaiApiKey: string;
    googleApiKey: string;
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
      `Programs app secrets validation failed:\n${errors}\n\n` +
        `Ensure all required environment variables are set.`
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Get production secrets.
 */
export function getSecrets(): SecretsConfig {
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
    ai: {
      openaiApiKey: env.OPENAI_API_KEY,
      googleApiKey: env.GOOGLE_API_KEY,
    },
  };
}

/**
 * Reset secrets cache (for testing).
 */
export function resetSecrets(): void {
  _env = null;
}
