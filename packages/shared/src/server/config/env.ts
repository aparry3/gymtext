/**
 * Server Environment Variables
 *
 * THE ONLY place in the codebase that validates server-side secrets.
 * App config overrides are handled by shared/config.
 */
import { z } from 'zod';

// =============================================================================
// Zod Schema - Server Secrets Only
// =============================================================================

const ServerEnvSchema = z.object({
  // -------------------------------------------------------------------------
  // Database
  // -------------------------------------------------------------------------
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  SESSION_ENCRYPTION_KEY: z.string().optional(),

  // -------------------------------------------------------------------------
  // Twilio
  // -------------------------------------------------------------------------
  TWILIO_ACCOUNT_SID: z.string().min(1, 'TWILIO_ACCOUNT_SID is required'),
  TWILIO_AUTH_TOKEN: z.string().min(1, 'TWILIO_AUTH_TOKEN is required'),
  TWILIO_NUMBER: z.string().min(1, 'TWILIO_NUMBER is required'),

  // -------------------------------------------------------------------------
  // Stripe
  // -------------------------------------------------------------------------
  STRIPE_SECRET_KEY: z.string().min(1, 'STRIPE_SECRET_KEY is required'),
  STRIPE_WEBHOOK_SECRET: z.string().optional(), // Optional for development

  // -------------------------------------------------------------------------
  // AI - validated but LangChain reads these directly from process.env
  // -------------------------------------------------------------------------
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  XAI_API_KEY: z.string().optional(),

  // -------------------------------------------------------------------------
  // Pinecone
  // -------------------------------------------------------------------------
  PINECONE_API_KEY: z.string().min(1, 'PINECONE_API_KEY is required'),
  PINECONE_INDEX: z.string().min(1, 'PINECONE_INDEX is required'),

  // -------------------------------------------------------------------------
  // Background Jobs
  // -------------------------------------------------------------------------
  CRON_SECRET: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // -------------------------------------------------------------------------
  // Environment (for server-side env detection)
  // -------------------------------------------------------------------------
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'staging', 'production']).optional(),
});

// =============================================================================
// Validation
// =============================================================================

function validateServerEnv() {
  const result = ServerEnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Server environment validation failed:\n${errors}\n\n` +
        `Ensure all required environment variables are set.`
    );
  }

  return result.data;
}

// Singleton - validated once at startup
let _serverEnv: z.infer<typeof ServerEnvSchema> | null = null;

/**
 * Get validated server environment variables.
 * Caches the result for subsequent calls.
 */
export function getServerEnv() {
  if (!_serverEnv) {
    _serverEnv = validateServerEnv();
  }
  return _serverEnv;
}

/**
 * Reset env cache (useful for testing).
 */
export function resetServerEnv() {
  _serverEnv = null;
}

// Export type
export type ServerEnv = z.infer<typeof ServerEnvSchema>;
