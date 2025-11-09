import { Kysely } from 'kysely';
import { DB } from '../src/server/models/_types';

export async function up(db: Kysely<DB>): Promise<void> {
  // Remove progress tracking columns from fitness_plans table
  // These are now calculated from dates instead of stored as state
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('current_mesocycle_index')
    .execute();

  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('current_microcycle_week')
    .execute();

  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('cycle_start_date')
    .execute();
}

export async function down(db: Kysely<DB>): Promise<void> {
  // Restore the columns if we need to rollback
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('current_mesocycle_index', 'integer', (col) => col.defaultTo(0))
    .execute();

  await db.schema
    .alterTable('fitness_plans')
    .addColumn('current_microcycle_week', 'integer', (col) => col.defaultTo(1))
    .execute();

  await db.schema
    .alterTable('fitness_plans')
    .addColumn('cycle_start_date', 'timestamp')
    .execute();
}
