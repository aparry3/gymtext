import { Kysely } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Drop formatted column from fitness_plans
  await db.schema
    .alterTable('fitness_plans')
    .dropColumn('formatted')
    .execute();

  // Drop formatted column from microcycles
  await db.schema
    .alterTable('microcycles')
    .dropColumn('formatted')
    .execute();
};

export async function down(db: Kysely<unknown>): Promise<void> {
  // Re-add formatted column to fitness_plans
  await db.schema
    .alterTable('fitness_plans')
    .addColumn('formatted', 'text')
    .execute();

  // Re-add formatted column to microcycles
  await db.schema
    .alterTable('microcycles')
    .addColumn('formatted', 'text')
    .execute();
};
