import { Kysely, PostgresDialect, FileMigrationProvider, Migrator } from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { Database } from '../src/shared/types/database';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  max: 10,
});

// Create the database instance
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool,
  }),
});

// Create the migrator
const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path: { join },
    migrationFolder: join(process.cwd(), 'migrations'),
  }),
});

// Get the command from command line args
const command = process.argv[2];

async function main() {
  if (command === 'up') {
    const { error, results } = await migrator.migrateUp();
    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was executed successfully`);
      } else if (it.status === 'Error') {
        console.error(`failed to execute migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error('failed to migrate');
      console.error(error);
      process.exit(1);
    }
  } else if (command === 'down') {
    const { error, results } = await migrator.migrateDown();
    results?.forEach((it) => {
      if (it.status === 'Success') {
        console.log(`migration "${it.migrationName}" was reverted successfully`);
      } else if (it.status === 'Error') {
        console.error(`failed to revert migration "${it.migrationName}"`);
      }
    });

    if (error) {
      console.error('failed to migrate');
      console.error(error);
      process.exit(1);
    }
  } else {
    console.error('Please provide a command: up or down');
    process.exit(1);
  }

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 