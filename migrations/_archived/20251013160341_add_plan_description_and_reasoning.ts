import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add plan_description column to fitness_plans table
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('plan_description', 'text')
    .execute();

  // Add reasoning column to fitness_plans table
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('reasoning', 'text')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Drop reasoning column
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('reasoning')
    .execute();

  // Drop plan_description column
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('plan_description')
    .execute();
}
