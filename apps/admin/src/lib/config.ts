/**
 * Admin App Config Loader
 *
 * Centralizes non-secret environment configuration for the admin app.
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
  WEB_API_URL: z.string().min(1, 'WEB_API_URL is required'),
});

type EnvVars = z.infer<typeof ConfigSchema>;

// =============================================================================
// Types
// =============================================================================

export interface AdminAppConfig {
  urls: {
    webApiUrl: string;
  };
}

// =============================================================================
// Loader
// =============================================================================

let _env: EnvVars | null = null;

function getEnv(): EnvVars {
  if (_env) return _env;

  const result = ConfigSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      .join('\n');

    throw new Error(
      `Admin app config validation failed:\n${errors}\n\n` +
        `Check your environment variables.`
    );
  }

  _env = result.data;
  return _env;
}

/**
 * Get app config from environment variables.
 */
export function getConfig(): AdminAppConfig {
  const env = getEnv();

  return {
    urls: {
      webApiUrl: env.WEB_API_URL,
    },
  };
}
