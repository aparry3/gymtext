import { Migration, sql } from 'kysely';

/**
 * ARCHIVE USER DATA - Pre-Migration Safety Net
 *
 * Runs BEFORE the consolidated new-agent-system migration (20260222134212).
 * Creates _deprecated_* archive tables and copies all existing user data,
 * then clears the live tables so the schema migration can safely drop/modify columns.
 *
 * Archive tables:
 * - _deprecated_profiles ← profiles (preserves structured column)
 * - _deprecated_fitness_plans ← fitness_plans (preserves structured, status, program_id, etc.)
 * - _deprecated_microcycles ← microcycles (preserves structured, days, absolute_week, etc.)
 * - _deprecated_workout_instances ← workout_instances (preserves structured, session_type, tags, etc.)
 *
 * Down migration: restores data from archive tables, drops archive tables.
 */

export const up: Migration = async (db) => {
  console.log('Starting ARCHIVE USER DATA migration...');

  // =============================================================================
  // 1. Archive profiles
  // =============================================================================
  console.log('Archiving profiles...');
  await sql`
    CREATE TABLE IF NOT EXISTS _deprecated_profiles AS
    SELECT * FROM profiles
  `.execute(db);
  const profileCount = await sql<{ count: string }>`SELECT COUNT(*) as count FROM _deprecated_profiles`.execute(db);
  console.log(`  Archived ${profileCount.rows[0]?.count} profiles`);

  // Clear live profiles
  await sql`TRUNCATE TABLE profiles CASCADE`.execute(db);
  console.log('  Cleared live profiles table');

  // =============================================================================
  // 2. Archive fitness_plans
  // =============================================================================
  console.log('Archiving fitness_plans...');
  await sql`
    CREATE TABLE IF NOT EXISTS _deprecated_fitness_plans AS
    SELECT * FROM fitness_plans
  `.execute(db);
  const planCount = await sql<{ count: string }>`SELECT COUNT(*) as count FROM _deprecated_fitness_plans`.execute(db);
  console.log(`  Archived ${planCount.rows[0]?.count} fitness_plans`);

  // Clear live fitness_plans (must clear microcycles and workout_instances first due to FK)
  // workout_instances references microcycles, microcycles may reference fitness_plans via plan_id (if column exists)
  // Clear child tables first

  // =============================================================================
  // 3. Archive microcycles
  // =============================================================================
  console.log('Archiving microcycles...');
  await sql`
    CREATE TABLE IF NOT EXISTS _deprecated_microcycles AS
    SELECT * FROM microcycles
  `.execute(db);
  const microcycleCount = await sql<{ count: string }>`SELECT COUNT(*) as count FROM _deprecated_microcycles`.execute(db);
  console.log(`  Archived ${microcycleCount.rows[0]?.count} microcycles`);

  // =============================================================================
  // 4. Archive workout_instances
  // =============================================================================
  console.log('Archiving workout_instances...');
  await sql`
    CREATE TABLE IF NOT EXISTS _deprecated_workout_instances AS
    SELECT * FROM workout_instances
  `.execute(db);
  const workoutCount = await sql<{ count: string }>`SELECT COUNT(*) as count FROM _deprecated_workout_instances`.execute(db);
  console.log(`  Archived ${workoutCount.rows[0]?.count} workout_instances`);

  // =============================================================================
  // 5. Clear live tables (child → parent order)
  // =============================================================================
  console.log('Clearing live tables...');
  await sql`TRUNCATE TABLE workout_instances CASCADE`.execute(db);
  console.log('  Cleared workout_instances');
  await sql`TRUNCATE TABLE microcycles CASCADE`.execute(db);
  console.log('  Cleared microcycles');
  await sql`TRUNCATE TABLE fitness_plans CASCADE`.execute(db);
  console.log('  Cleared fitness_plans');

  console.log('ARCHIVE USER DATA migration complete!');
};

export const down: Migration = async (db) => {
  console.log('Rolling back ARCHIVE USER DATA migration...');

  // Restore data from archive tables (child → parent, so insert parent first)

  // 1. Restore profiles
  const profilesExist = await sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_deprecated_profiles') as exists
  `.execute(db);
  if (profilesExist.rows[0]?.exists) {
    console.log('Restoring profiles...');
    await sql`TRUNCATE TABLE profiles CASCADE`.execute(db);
    await sql`INSERT INTO profiles SELECT * FROM _deprecated_profiles`.execute(db);
    await sql`DROP TABLE _deprecated_profiles`.execute(db);
  }

  // 2. Restore fitness_plans
  const plansExist = await sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_deprecated_fitness_plans') as exists
  `.execute(db);
  if (plansExist.rows[0]?.exists) {
    console.log('Restoring fitness_plans...');
    await sql`TRUNCATE TABLE fitness_plans CASCADE`.execute(db);
    await sql`INSERT INTO fitness_plans SELECT * FROM _deprecated_fitness_plans`.execute(db);
    await sql`DROP TABLE _deprecated_fitness_plans`.execute(db);
  }

  // 3. Restore microcycles
  const microcyclesExist = await sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_deprecated_microcycles') as exists
  `.execute(db);
  if (microcyclesExist.rows[0]?.exists) {
    console.log('Restoring microcycles...');
    await sql`TRUNCATE TABLE microcycles CASCADE`.execute(db);
    await sql`INSERT INTO microcycles SELECT * FROM _deprecated_microcycles`.execute(db);
    await sql`DROP TABLE _deprecated_microcycles`.execute(db);
  }

  // 4. Restore workout_instances
  const workoutsExist = await sql<{ exists: boolean }>`
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '_deprecated_workout_instances') as exists
  `.execute(db);
  if (workoutsExist.rows[0]?.exists) {
    console.log('Restoring workout_instances...');
    await sql`TRUNCATE TABLE workout_instances CASCADE`.execute(db);
    await sql`INSERT INTO workout_instances SELECT * FROM _deprecated_workout_instances`.execute(db);
    await sql`DROP TABLE _deprecated_workout_instances`.execute(db);
  }

  console.log('Rollback complete!');
};
