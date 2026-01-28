/**
 * Programs App Context
 *
 * Provides context and service creation for the programs portal.
 * Always uses production credentials (no environment switching like admin).
 *
 * @example
 * // In an API route:
 * import { getProgramsContext } from '@/lib/context';
 *
 * export async function GET() {
 *   const { services } = await getProgramsContext();
 *   const programs = await services.program.listAll();
 *   return Response.json({ programs });
 * }
 */

import { createDatabase } from '@gymtext/shared/server';
import { createRepositories, type RepositoryContainer } from '@gymtext/shared/server';
import { createServices, type ServiceContainer } from '@gymtext/shared/server';
import type { Kysely } from 'kysely';
import type { DB } from '@gymtext/shared/server';
import { getSecrets } from './secrets';

export interface ProgramsContext {
  /** Database connection */
  db: Kysely<DB>;
  /** Repository container */
  repos: RepositoryContainer;
  /** Service container */
  services: ServiceContainer;
}

// Cache db instance
let _db: Kysely<DB> | null = null;

function getOrCreateDb(url: string): Kysely<DB> {
  if (!_db) {
    _db = createDatabase(url);
  }
  return _db;
}

/**
 * Get programs context for the current request
 *
 * This function provides:
 * - Database connection (always production)
 * - Service container
 *
 * @example
 * const { services } = await getProgramsContext();
 * const owner = await services.programOwner.getById(ownerId);
 */
export async function getProgramsContext(): Promise<ProgramsContext> {
  const secrets = getSecrets();

  const db = getOrCreateDb(secrets.database.url);
  const repos = createRepositories(db);
  const services = createServices(repos);

  return { db, repos, services };
}

/**
 * Clear cached database instance (for testing)
 */
export function clearDbCache(): void {
  _db = null;
}

// Re-export useful types
export type { ServiceContainer, RepositoryContainer };
