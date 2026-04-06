/**
 * Integration Test Setup — Transaction Rollback Pattern
 *
 * Every integration test runs inside a database transaction that is ALWAYS
 * rolled back. This means:
 *   - Tests are fully idempotent — zero data committed to the database
 *   - Safe to run against any database (production, staging, local)
 *   - No separate test database required
 *   - No cleanup needed between tests
 *
 * Uses DATABASE_URL from environment (same as the app).
 *
 * Usage in test files:
 *   import { getTestDb, closeTestDb, startTestTransaction } from '../../setup';
 *
 *   let trx: Kysely<DB>;
 *   let triggerRollback: (() => void) | null = null;
 *
 *   beforeEach(async () => {
 *     await startTestTransaction(getTestDb(), (t, rollback) => {
 *       trx = t;
 *       triggerRollback = rollback;
 *     });
 *   });
 *   afterEach(() => { triggerRollback?.(); });
 *   afterAll(() => closeTestDb());
 */
import { Kysely, PostgresDialect, CamelCasePlugin } from 'kysely';
import { Pool } from 'pg';
import type { DB } from '../../packages/shared/src/server/models/_types';

// ── Sentinel error for forcing transaction rollback ──────────────
class RollbackError extends Error {
  constructor() {
    super('__test_rollback__');
    this.name = 'RollbackError';
  }
}

// ── Shared pool (one per test process) ───────────────────────────
let testDb: Kysely<DB> | null = null;
let testPool: Pool | null = null;

function getConnectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required to run integration tests. ' +
      'Run: source .env.local && pnpm test',
    );
  }
  return url;
}

/**
 * Get (or create) the shared test database connection.
 */
export function getTestDb(): Kysely<DB> {
  if (!testDb) {
    testPool = new Pool({ connectionString: getConnectionString(), max: 5 });
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

// ── Transaction lifecycle helper ─────────────────────────────────

/**
 * Start a transaction that stays open until `rollback()` is called.
 *
 * Returns a promise that resolves once the transaction is open and `trx` is ready.
 * The transaction will be rolled back when the `rollback` callback is invoked.
 *
 * @param db - The Kysely instance (from getTestDb)
 * @param onReady - Called with (trx, rollback) once the transaction is open.
 */
export function startTestTransaction(
  db: Kysely<DB>,
  onReady: (trx: Kysely<DB>, rollback: () => void) => void,
): Promise<void> {
  return new Promise<void>((resolveReady) => {
    // Start the transaction. It will stay open until rollbackFn is called.
    const txPromise = db.transaction().execute(async (trx) => {
      // Create a promise that blocks the transaction from completing
      // until the test calls rollback()
      await new Promise<void>((_, rejectToRollback) => {
        // Hand the transaction and rollback trigger to the caller
        onReady(trx as unknown as Kysely<DB>, () => rejectToRollback(new RollbackError()));
        // Signal that trx is ready — beforeEach can now complete
        resolveReady();
      });
    });

    // Swallow the expected RollbackError from the transaction promise
    txPromise.catch((e) => {
      if (e instanceof RollbackError) return; // Expected
      // Re-throw unexpected errors
      console.error('[TestSetup] Unexpected transaction error:', e);
    });
  });
}

// ── Data insertion helpers ───────────────────────────────────────

/**
 * Insert a subscription row for a user.
 */
export async function insertSubscription(
  db: Kysely<DB>,
  userId: string,
  status: 'active' | 'cancel_pending' | 'canceled',
  overrides: {
    stripeSubscriptionId?: string;
    currentPeriodEnd?: Date;
    currentPeriodStart?: Date;
    planType?: string;
  } = {},
): Promise<void> {
  const now = new Date();
  const periodEnd = overrides.currentPeriodEnd ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await db
    .insertInto('subscriptions')
    .values({
      clientId: userId,
      status,
      stripeSubscriptionId: overrides.stripeSubscriptionId ?? `sub_test_${Math.random().toString(36).slice(2, 10)}`,
      planType: overrides.planType ?? 'monthly',
      currentPeriodStart: overrides.currentPeriodStart ?? now,
      currentPeriodEnd: periodEnd,
      canceledAt: status === 'canceled' ? now : null,
    })
    .execute();
}
