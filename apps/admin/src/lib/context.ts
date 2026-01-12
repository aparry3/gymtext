/**
 * Admin App Context
 *
 * Provides context and service creation for the admin portal.
 * Supports environment switching between production and sandbox.
 *
 * @example
 * // In an API route:
 * import { getAdminContext } from '@/lib/context';
 *
 * export async function GET() {
 *   const { services, mode, webApiUrl } = await getAdminContext();
 *   const users = await services.user.listUsersForAdmin({});
 *   return Response.json({ users, environment: mode });
 * }
 */

import { headers } from 'next/headers';
import { createDatabase } from '@gymtext/shared/server';
import { createRepositories, type RepositoryContainer } from '@gymtext/shared/server';
import { createServices, type ServiceContainer } from '@gymtext/shared/server';
import type { Kysely } from 'kysely';
import type { DB } from '@gymtext/shared/server';
import {
  getSecretsForMode,
  getProductionSecrets,
  type EnvironmentMode,
} from './secrets';
import { getConfigForMode, getProductionConfig } from './config';

export type { EnvironmentMode } from './secrets';

export interface AdminContext {
  /** Current environment mode */
  mode: EnvironmentMode;
  /** Database connection for this environment */
  db: Kysely<DB>;
  /** Repository container for this environment */
  repos: RepositoryContainer;
  /** Service container for this environment */
  services: ServiceContainer;
  /** Web API URL for this environment (for operations that need Twilio/Stripe) */
  webApiUrl: string;
}

// Cache db instances by connection string
const dbCache = new Map<string, Kysely<DB>>();

function getOrCreateDb(url: string): Kysely<DB> {
  if (!dbCache.has(url)) {
    dbCache.set(url, createDatabase(url));
  }
  return dbCache.get(url)!;
}

/**
 * Get the current environment mode from the request header
 * The header is set by middleware based on the gt_env cookie
 */
export async function getEnvironmentMode(): Promise<EnvironmentMode> {
  try {
    const headerStore = await headers();
    const envHeader = headerStore.get('x-gymtext-env');
    if (envHeader === 'sandbox') {
      return 'sandbox';
    }
  } catch {
    // Outside request context, default to production
  }
  return 'production';
}

/**
 * Get admin context for the current request
 *
 * This function reads the X-Gymtext-Env header (set by middleware) to determine
 * which environment to use. The context includes:
 * - Database connection (production or sandbox)
 * - Service container
 * - Web API URL for the environment
 *
 * @example
 * const { services, mode } = await getAdminContext();
 * const users = await services.user.listUsersForAdmin({});
 */
export async function getAdminContext(): Promise<AdminContext> {
  const mode = await getEnvironmentMode();
  const secrets = getSecretsForMode(mode);
  const config = getConfigForMode(mode);

  // Create context
  const db = getOrCreateDb(secrets.database.url);
  const repos = createRepositories(db);
  const services = createServices(repos);

  return { mode, db, repos, services, webApiUrl: config.urls.webApiUrl };
}

/**
 * Get production context (ignores header, always uses production)
 * Useful for operations that should always use production data
 */
export async function getProductionContext(): Promise<AdminContext> {
  const secrets = getProductionSecrets();
  const config = getProductionConfig();

  const db = getOrCreateDb(secrets.database.url);
  const repos = createRepositories(db);
  const services = createServices(repos);

  return { mode: 'production', db, repos, services, webApiUrl: config.urls.webApiUrl };
}

/**
 * Clear all cached database instances (for testing)
 */
export function clearDbCache(): void {
  dbCache.clear();
}

// Re-export useful types
export type { ServiceContainer, RepositoryContainer };
