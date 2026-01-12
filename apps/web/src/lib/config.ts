/**
 * Web App Config Loader
 *
 * Centralizes non-secret environment configuration for the web app.
 *
 * Secrets vs Config:
 * - Secrets (secrets.ts): Sensitive credentials (API keys, database passwords, auth tokens)
 * - Config (this file): Non-sensitive settings (URLs, feature flags)
 */

import { z } from 'zod';

// =============================================================================
// Schema
// =============================================================================

const ConfigSchema = z.object({
  // URLs
  BASE_URL: z.string().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().optional(),
});

// =============================================================================
// Types
// =============================================================================

export interface AppConfig {
  urls: {
    baseUrl?: string;
    publicBaseUrl?: string;
  };
}

// =============================================================================
// Loader
// =============================================================================

let _config: AppConfig | null = null;

function loadConfig(): AppConfig {
  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Web app config validation failed:\n${errors}\n\n` +
        `Check your environment variables.`
    );
  }

  const env = result.data;

  return {
    urls: {
      baseUrl: env.BASE_URL,
      publicBaseUrl: env.NEXT_PUBLIC_BASE_URL,
    },
  };
}

/**
 * Get validated config for the web app.
 * Caches the result for subsequent calls.
 */
export function getAppConfig(): AppConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Reset config cache (for testing).
 */
export function resetAppConfig(): void {
  _config = null;
}
