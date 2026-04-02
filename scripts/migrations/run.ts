import { Kysely, PostgresDialect, Migrator, sql } from 'kysely';
import type { MigrationProvider, Migration } from 'kysely';
import { Pool } from 'pg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { DB } from '@/server/models';

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
const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool,
  }),
});

const migrationsFolder = join(process.cwd(), 'migrations');

/**
 * Custom MigrationProvider that tolerates deleted migration files.
 *
 * When a migration was previously run but its file no longer exists
 * (e.g., after consolidating two migrations into one on a feature branch),
 * this provider supplies a no-op stub so the migrator doesn't crash.
 */
class TolerantMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    // 1. Read migrations from disk
    const files = await fs.readdir(migrationsFolder);
    const migrations: Record<string, Migration> = {};

    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;

      const name = file.replace(/\.(ts|js)$/, '');
      const mod = await import(join(migrationsFolder, file));
      migrations[name] = mod;
    }

    // 2. Check for previously-executed migrations missing from disk
    try {
      const executed = await sql<{ name: string }>`
        SELECT name FROM kysely_migration ORDER BY name
      `.execute(db);

      for (const row of executed.rows) {
        if (!migrations[row.name]) {
          console.log(`Migration "${row.name}" was previously executed but file is missing — using no-op stub`);
          migrations[row.name] = {
            up: async () => {},
            down: async () => {},
          };
        }
      }
    } catch {
      // kysely_migration table may not exist yet (first run) — that's fine
    }

    return migrations;
  }
}

// Create the migrator
const migrator = new Migrator({
  db,
  provider: new TolerantMigrationProvider(),
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
  } else if (command === 'latest') {
    const { error, results } = await migrator.migrateToLatest();
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
    console.error('Please provide a command: up, latest, or down');
    process.exit(1);
  }

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
