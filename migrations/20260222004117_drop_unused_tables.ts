import { Migration } from 'kysely';

export const up: Migration = async (db) => {
  await db.schema.dropTable('prompts').ifExists().execute();
  await db.schema.dropTable('context_templates').ifExists().execute();
};

export const down: Migration = async (db) => {
  // No rollback - these tables are dead anyway
};
