import { Kysely } from 'kysely';

/**
 * Add description column to fitness_plans table
 * This stores the long-form comprehensive fitness plan with all details
 */
export async function up(db: Kysely<any>): Promise<void> {
  console.log('Adding description column to fitness_plans...');

  await db.schema
    .alterTable('fitness_plans')
    .addColumn('description', 'text')
    .execute();

  console.log('✓ Added description column to fitness_plans');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('description')
    .execute();
}
