import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('fitness_plans').addColumn('structured', 'jsonb').execute();
  await db.schema.alterTable('microcycles').addColumn('structured', 'jsonb').execute();
  await db.schema.alterTable('workout_instances').addColumn('structured', 'jsonb').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('fitness_plans').dropColumn('structured').execute();
  await db.schema.alterTable('microcycles').dropColumn('structured').execute();
  await db.schema.alterTable('workout_instances').dropColumn('structured').execute();
}
