import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Drop the plan_description column (keeping description for the long-form plan)
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('plan_description')
    .execute();

  // Drop reasoning column (no longer storing this)
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('reasoning')
    .execute();

  // Drop overview column (no longer storing this)
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('overview')
    .execute();

  // Note: mesocycles column already exists as text[] (string array)
  // We'll just be storing mesocycle overview strings instead of JSON
}

export async function down(db: Kysely<any>): Promise<void> {
  // Restore overview column
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('overview', 'text')
    .execute();

  // Restore reasoning column
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('reasoning', 'text')
    .execute();

  // Restore plan_description column
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('plan_description', 'text')
    .execute();
}
