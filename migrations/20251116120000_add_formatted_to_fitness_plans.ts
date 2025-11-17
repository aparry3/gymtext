import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add formatted column to fitness_plans table
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('formatted', 'text')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove formatted column
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('formatted')
    .execute();
}
