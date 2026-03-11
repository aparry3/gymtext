/**
 * Integration Test Setup
 *
 * Provides a real database connection for integration tests using the gymtext_test database.
 * Creates a Kysely instance with CamelCasePlugin matching production config.
 *
 * Usage:
 *   import { getTestDb, closeTestDb } from '../../setup';
 */
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '../../packages/shared/src/server/models/_types';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/gymtext_test';

let testDb: Kysely<DB> | null = null;
let testPool: Pool | null = null;

/**
 * Get (or create) the shared test database connection.
 */
export function getTestDb(): Kysely<DB> {
  if (!testDb) {
    testPool = new Pool({ connectionString: TEST_DATABASE_URL, max: 5 });
    testDb = new Kysely<DB>({
      dialect: new PostgresDialect({ pool: testPool }),
      plugins: [new CamelCasePlugin()],
    });
  }
  return testDb;
}

/**
 * Tear down the test database connection. Call in afterAll.
 */
export async function closeTestDb(): Promise<void> {
  if (testDb) {
    await testDb.destroy();
    testDb = null;
    testPool = null;
  }
}

/**
 * Truncate the core tables used in daily-message tests.
 * Respects FK ordering: children first, then parents.
 */
export async function cleanTestData(db: Kysely<DB>): Promise<void> {
  // Truncate in dependency order (children → parents)
  await db.deleteFrom('messageQueues').execute();
  await db.deleteFrom('messages').execute();
  await db.deleteFrom('workoutInstances').execute();
  await db.deleteFrom('profiles').execute();
  await db.deleteFrom('users').execute();
}
