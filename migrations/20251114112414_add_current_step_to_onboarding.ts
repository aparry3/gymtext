import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add current_step column to track onboarding progress
  await db.schema
    .alterTable('user_onboarding')
    .addColumn('current_step', 'integer')
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove current_step column
  await db.schema
    .alterTable('user_onboarding')
    .dropColumn('current_step')
    .execute();
}
