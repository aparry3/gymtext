import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Truncate and update admin_activity_logs
  await sql`TRUNCATE TABLE admin_activity_logs`.execute(db);
  await db.schema.alterTable('admin_activity_logs')
    .renameColumn('actor_user_id', 'actor_client_id')
    .execute();
  await db.schema.alterTable('admin_activity_logs')
    .renameColumn('target_user_id', 'target_client_id')
    .execute();

  // Rename user_id to client_id in all 7 tables
  const tables = [
    'profile_updates',
    'subscriptions',
    'messages',
    'microcycles',
    'message_queues',
    'user_onboarding',
    'short_links'
  ];

  for (const table of tables) {
    await db.schema.alterTable(table)
      .renameColumn('user_id', 'client_id')
      .execute();
  }
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Reverse the column renames
  const tables = [
    'profile_updates',
    'subscriptions',
    'messages',
    'microcycles',
    'message_queues',
    'user_onboarding',
    'short_links'
  ];

  for (const table of tables) {
    await db.schema.alterTable(table)
      .renameColumn('client_id', 'user_id')
      .execute();
  }

  await db.schema.alterTable('admin_activity_logs')
    .renameColumn('actor_client_id', 'actor_user_id')
    .execute();
  await db.schema.alterTable('admin_activity_logs')
    .renameColumn('target_client_id', 'target_user_id')
    .execute();
}
