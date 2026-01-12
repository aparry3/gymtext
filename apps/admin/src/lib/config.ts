/**
 * Admin App Config Loader
 *
 * Centralizes non-secret environment configuration for the admin app.
 * Supports environment switching between production and sandbox.
 *
 * Secrets vs Config:
 * - Secrets (secrets.ts): Sensitive credentials (API keys, database passwords, auth tokens)
 * - Config (this file): Non-sensitive settings (URLs, feature flags)
 */

import { z } from 'zod';
import type { EnvironmentMode } from './secrets';

// =============================================================================
// Schema
// =============================================================================

const ConfigSchema = z.object({
  // Production URLs
  WEB_API_URL: z.string().min(1, 'WEB_API_URL is required'),

  // Sandbox URLs (optional, falls back to production)
  SANDBOX_WEB_API_URL: z.string().optional(),
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
 * Get production config.
 */
export function getProductionConfig(): AdminAppConfig {
  const env = getEnv();

  return {
    urls: {
      webApiUrl: env.WEB_API_URL,
    },
  };
}

/**
 * Get sandbox config.
 * Falls back to production for any unset sandbox variables.
 */
export function getSandboxConfig(): AdminAppConfig {
  const env = getEnv();
  const prod = getProductionConfig();

  return {
    urls: {
      webApiUrl: env.SANDBOX_WEB_API_URL || prod.urls.webApiUrl,
    },
  };
}

/**
 * Get config for a specific environment mode.
 */
export function getConfigForMode(mode: EnvironmentMode): AdminAppConfig {
  return mode === 'sandbox' ? getSandboxConfig() : getProductionConfig();
}

/**
 * Reset config cache (for testing).
 */
export function resetAppConfig(): void {
  _env = null;
}
