import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '@/shared/types/database';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of clients in the pool
});

// Create and export the database instance
export const postgresDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

// Export pool for direct access if needed
export { pool };