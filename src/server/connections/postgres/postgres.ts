import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '@/server/models/_types';
import { getDatabaseSecrets } from '@/server/config';

// Get the database URL from validated server config
const { databaseUrl } = getDatabaseSecrets();

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10, // Maximum number of clients in the pool
});

// Create and export the database instance
export const postgresDb = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
  plugins: [new CamelCasePlugin()],
});

// Export pool for direct access if needed
export { pool };