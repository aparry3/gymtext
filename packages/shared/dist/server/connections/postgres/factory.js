/**
 * Database Connection Factory
 *
 * Creates Kysely database instances on-demand. Supports multiple
 * connection strings for environment switching (sandbox/production).
 *
 * Uses internal caching to reuse pools for the same connection string.
 */
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
// Cache pools by connection string to avoid creating new pools for same env
const poolCache = new Map();
const dbCache = new Map();
/**
 * Create or retrieve a cached database connection
 * @param connectionString - PostgreSQL connection string
 * @returns Kysely database instance
 */
export function createDatabase(connectionString) {
    // Return cached instance if available
    if (dbCache.has(connectionString)) {
        return dbCache.get(connectionString);
    }
    // Create or get cached pool
    let pool = poolCache.get(connectionString);
    if (!pool) {
        pool = new Pool({
            connectionString,
            max: 10, // Maximum number of clients in the pool
        });
        poolCache.set(connectionString, pool);
    }
    // Create Kysely instance
    const db = new Kysely({
        dialect: new PostgresDialect({ pool }),
        plugins: [new CamelCasePlugin()],
    });
    dbCache.set(connectionString, db);
    return db;
}
/**
 * Get the pool for a connection string (for direct pool access if needed)
 * @param connectionString - PostgreSQL connection string
 * @returns Pool instance
 */
export function getPool(connectionString) {
    let pool = poolCache.get(connectionString);
    if (!pool) {
        pool = new Pool({
            connectionString,
            max: 10,
        });
        poolCache.set(connectionString, pool);
    }
    return pool;
}
/**
 * Close all cached pools (for graceful shutdown)
 */
export async function closeAllPools() {
    const pools = Array.from(poolCache.values());
    await Promise.all(pools.map(pool => pool.end()));
    poolCache.clear();
    dbCache.clear();
}
/**
 * Get all active pool connection strings (for debugging)
 */
export function getActiveConnections() {
    return Array.from(poolCache.keys());
}
