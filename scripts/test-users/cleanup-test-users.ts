/**
 * Clean up test users created from personas
 *
 * Deletes all users with phone numbers in the test range +13392220001 through +13392220015.
 *
 * Usage:
 *   pnpm test:cleanup-users
 *   pnpm test:cleanup-users --dry-run    # Show what would be deleted
 *
 * Environment:
 *   Requires DATABASE_URL in .env.local
 */

import 'dotenv/config';
import { Pool } from 'pg';

const TEST_PHONE_PREFIX = '+1339222';
const TEST_PHONE_MIN = '+13392220001';
const TEST_PHONE_MAX = '+13392220015';

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL not set. Check .env.local');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });

  try {
    // Find all test users
    const result = await pool.query(
      `SELECT id, name, phone_number FROM users
       WHERE phone_number >= $1 AND phone_number <= $2
       ORDER BY phone_number`,
      [TEST_PHONE_MIN, TEST_PHONE_MAX]
    );

    if (result.rows.length === 0) {
      console.log('\n✅ No test users found. Nothing to clean up.\n');
      return;
    }

    console.log(`\n🧹 Found ${result.rows.length} test user(s):\n`);
    for (const row of result.rows) {
      console.log(`  ${row.phone_number}  ${row.name.padEnd(22)}  ${row.id}`);
    }

    if (dryRun) {
      console.log(`\n  (dry run - no changes made)\n`);
      return;
    }

    console.log(`\n🗑️  Deleting...`);

    // Delete related data for each user, then users
    const tables = [
      'exercise_metrics',
      'workout_exercises',
      'workouts',
      'microcycles',
      'fitness_plans',
      'user_profiles',
      'onboarding_data',
      'messages',
      'subscriptions',
    ];

    const userIds = result.rows.map((r) => r.id);

    for (const table of tables) {
      try {
        const del = await pool.query(
          `DELETE FROM ${table} WHERE client_id = ANY($1::uuid[])`,
          [userIds]
        );
        if (del.rowCount && del.rowCount > 0) {
          console.log(`  ${table}: ${del.rowCount} rows deleted`);
        }
      } catch {
        // Table might not exist or have different schema
      }
    }

    // Delete users
    const del = await pool.query(
      `DELETE FROM users WHERE id = ANY($1::uuid[])`,
      [userIds]
    );
    console.log(`  users: ${del.rowCount} rows deleted`);

    console.log(`\n✅ Cleaned up ${result.rows.length} test user(s).\n`);
  } catch (err) {
    console.error('\n❌ Error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
