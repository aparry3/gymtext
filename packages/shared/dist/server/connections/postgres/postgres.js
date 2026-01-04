/**
 * PostgreSQL Connection
 *
 * This module provides the default database connection using the
 * DATABASE_URL environment variable. For environment switching
 * (sandbox/production), use the factory functions instead.
 */
import { getDatabaseSecrets } from '@/server/config';
import { createDatabase, getPool } from './factory';
// Get the database URL from validated server config
const { databaseUrl } = getDatabaseSecrets();
// Create default database instance using factory
export const postgresDb = createDatabase(databaseUrl);
// Export default pool for direct access if needed
export const pool = getPool(databaseUrl);
// Re-export factory functions for environment switching
export { createDatabase, getPool, closeAllPools, getActiveConnections } from './factory';
