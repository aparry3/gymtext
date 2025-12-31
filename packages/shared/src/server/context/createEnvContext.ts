/**
 * Environment Context Factory
 *
 * Creates environment-specific context objects for request handling.
 * Supports switching between sandbox and production environments
 * based on the X-Gymtext-Env header (set by admin middleware).
 *
 * @example
 * // In an API route
 * const ctx = await createEnvContext();
 * const users = await ctx.db.selectFrom('users').selectAll().execute();
 *
 * @example
 * // Force production context
 * const ctx = await createEnvContext('production');
 */
import { headers } from 'next/headers';
import type { EnvironmentContext, EnvironmentMode, EnvironmentSecretsConfig } from './types';
import { createDatabase } from '@/server/connections/postgres/factory';
import { createTwilioClient } from '@/server/connections/twilio/factory';
import { createStripeClient } from '@/server/connections/stripe/factory';
import { getUrlsConfig } from '@/shared/config';

/**
 * Environment secrets loaded from process.env
 * These are loaded once at startup
 */
function loadEnvironmentSecrets(): EnvironmentSecretsConfig {
  return {
    production: {
      database: {
        url: process.env.DATABASE_URL!,
      },
      twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID!,
        authToken: process.env.TWILIO_AUTH_TOKEN!,
        phoneNumber: process.env.TWILIO_NUMBER!,
      },
      stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY!,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      },
    },
    sandbox: {
      database: {
        url: process.env.SANDBOX_DATABASE_URL || process.env.DATABASE_URL!,
      },
      twilio: {
        accountSid: process.env.SANDBOX_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID!,
        authToken: process.env.SANDBOX_TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN!,
        phoneNumber: process.env.SANDBOX_TWILIO_NUMBER || process.env.TWILIO_NUMBER!,
      },
      stripe: {
        secretKey: process.env.SANDBOX_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY!,
        webhookSecret: process.env.SANDBOX_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET!,
      },
    },
    shared: {
      ai: {
        openaiApiKey: process.env.OPENAI_API_KEY!,
        googleApiKey: process.env.GOOGLE_API_KEY!,
      },
      pinecone: {
        apiKey: process.env.PINECONE_API_KEY!,
        indexName: process.env.PINECONE_INDEX!,
      },
    },
  };
}

// Cache for environment contexts (one per mode)
const contextCache = new Map<EnvironmentMode, EnvironmentContext>();

/**
 * Create an environment context for the current request
 *
 * @param overrideMode - Optional mode to override header-based detection
 * @returns EnvironmentContext for the specified environment
 */
export async function createEnvContext(
  overrideMode?: EnvironmentMode
): Promise<EnvironmentContext> {
  // Determine mode from header or override
  let mode: EnvironmentMode = 'production';

  if (overrideMode) {
    mode = overrideMode;
  } else {
    try {
      const headerStore = await headers();
      const envHeader = headerStore.get('x-gymtext-env');
      if (envHeader === 'sandbox' || envHeader === 'production') {
        mode = envHeader;
      }
    } catch {
      // headers() may fail outside of request context, default to production
    }
  }

  // Return cached context if available
  if (contextCache.has(mode)) {
    return contextCache.get(mode)!;
  }

  // Load secrets
  const envSecrets = loadEnvironmentSecrets();
  const modeSecrets = envSecrets[mode];
  const sharedSecrets = envSecrets.shared;

  // Build status callback URL
  const { baseUrl } = getUrlsConfig();
  const statusCallbackUrl = baseUrl ? `${baseUrl}/api/twilio/status` : undefined;

  // Create context with initialized connections
  const context: EnvironmentContext = {
    mode,
    secrets: {
      ...modeSecrets,
      ...sharedSecrets,
    },
    db: createDatabase(modeSecrets.database.url),
    twilioClient: createTwilioClient(modeSecrets.twilio, statusCallbackUrl),
    stripeClient: createStripeClient(modeSecrets.stripe),
  };

  // Cache for reuse
  contextCache.set(mode, context);
  return context;
}

/**
 * Create a production-only context (for web app)
 * This always returns production context regardless of headers
 */
export async function createProductionContext(): Promise<EnvironmentContext> {
  return createEnvContext('production');
}

/**
 * Clear the context cache (for testing)
 */
export function clearContextCache(): void {
  contextCache.clear();
}

/**
 * Check if sandbox environment is configured
 * Returns true if SANDBOX_DATABASE_URL is set
 */
export function isSandboxConfigured(): boolean {
  return !!process.env.SANDBOX_DATABASE_URL;
}
