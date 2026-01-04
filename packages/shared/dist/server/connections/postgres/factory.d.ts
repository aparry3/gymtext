/**
 * Database Connection Factory
 *
 * Creates Kysely database instances on-demand. Supports multiple
 * connection strings for environment switching (sandbox/production).
 *
 * Uses internal caching to reuse pools for the same connection string.
 */
import { Kysely } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '@/server/models/_types';
/**
 * Create or retrieve a cached database connection
 * @param connectionString - PostgreSQL connection string
 * @returns Kysely database instance
 */
export declare function createDatabase(connectionString: string): Kysely<DB>;
/**
 * Get the pool for a connection string (for direct pool access if needed)
 * @param connectionString - PostgreSQL connection string
 * @returns Pool instance
 */
export declare function getPool(connectionString: string): Pool;
/**
 * Close all cached pools (for graceful shutdown)
 */
export declare function closeAllPools(): Promise<void>;
/**
 * Get all active pool connection strings (for debugging)
 */
export declare function getActiveConnections(): string[];
//# sourceMappingURL=factory.d.ts.map