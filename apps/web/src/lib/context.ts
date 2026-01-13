/**
 * Web App Context
 *
 * Provides context and service creation for the consumer-facing app.
 * This app always uses production environment.
 *
 * @example
 * // In an API route:
 * import { getServices } from '@/lib/context';
 *
 * export async function GET() {
 *   const services = getServices();
 *   const users = await services.user.listUsersForAdmin({});
 *   return Response.json(users);
 * }
 */

import { createDatabase } from '@gymtext/shared/server';
import { createRepositories, type RepositoryContainer } from '@gymtext/shared/server';
import { createServices, type ServiceContainer } from '@gymtext/shared/server';
import type { Kysely } from 'kysely';
import type { DB } from '@gymtext/shared/server';
import { getSecrets } from './secrets';

// Singleton caches for production
let _db: Kysely<DB> | null = null;
let _repos: RepositoryContainer | null = null;
let _services: ServiceContainer | null = null;

/**
 * Get the database connection (production only, cached)
 */
export function getDb(): Kysely<DB> {
  if (!_db) {
    const secrets = getSecrets();
    _db = createDatabase(secrets.database.url);
  }
  return _db;
}

/**
 * Get the repository container (production only, cached)
 */
export function getRepositories(): RepositoryContainer {
  if (!_repos) {
    _repos = createRepositories(getDb());
  }
  return _repos;
}

/**
 * Get the service container (production only, cached)
 *
 * @example
 * const services = getServices();
 * const user = await services.user.getUserById(userId);
 * const plan = await services.fitnessPlan.getCurrentPlan(userId);
 */
export function getServices(): ServiceContainer {
  if (!_services) {
    _services = createServices(getRepositories());
  }
  return _services;
}

/**
 * Clear all cached instances (for testing)
 */
export function clearContext(): void {
  _db = null;
  _repos = null;
  _services = null;
}

// Re-export useful types
export type { ServiceContainer, RepositoryContainer };
