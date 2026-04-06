/**
 * Admin App Context
 *
 * Provides context and service creation for the admin portal.
 *
 * @example
 * // In an API route:
 * import { getAdminContext } from '@/lib/context';
 *
 * export async function GET() {
 *   const { services, webApiUrl } = await getAdminContext();
 *   const users = await services.user.listUsersForAdmin({});
 *   return Response.json({ users });
 * }
 */

import { createDatabase } from '@gymtext/shared/server';
import { createRepositories, type RepositoryContainer } from '@gymtext/shared/server';
import { createServices, type ServiceContainer } from '@gymtext/shared/server';
import type { Kysely } from 'kysely';
import type { DB } from '@gymtext/shared/server/models/_types';
import { getSecrets } from './secrets';
import { getConfig } from './config';

export interface AdminContext {
  /** Database connection */
  db: Kysely<DB>;
  /** Repository container */
  repos: RepositoryContainer;
  /** Service container */
  services: ServiceContainer;
  /** Web API URL (for operations that need Twilio/Stripe callbacks) */
  webApiUrl: string;
}

// Cache db instance by connection string
let cachedDb: Kysely<DB> | null = null;
let cachedDbUrl: string | null = null;

function getOrCreateDb(url: string): Kysely<DB> {
  if (cachedDb && cachedDbUrl === url) {
    return cachedDb;
  }
  cachedDb = createDatabase(url);
  cachedDbUrl = url;
  return cachedDb;
}

/**
 * Get admin context for the current request.
 *
 * @example
 * const { services } = await getAdminContext();
 * const users = await services.user.listUsersForAdmin({});
 */
export async function getAdminContext(): Promise<AdminContext> {
  const secrets = getSecrets();
  const config = getConfig();

  const db = getOrCreateDb(secrets.database.url);
  const repos = createRepositories(db);
  const services = createServices(repos);

  return { db, repos, services, webApiUrl: config.urls.webApiUrl };
}

// Re-export useful types
export type { ServiceContainer, RepositoryContainer };
