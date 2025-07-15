import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { Database } from '../../shared/types/database';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is not set');

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool }),
}); 