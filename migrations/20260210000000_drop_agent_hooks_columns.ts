import { Kysely, sql } from 'kysely';

/**
 * Drop hooks and tool_hooks columns from agent_definitions
 *
 * These columns are no longer used after the hook system was removed
 * in favor of direct service-layer orchestration.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Dropping hooks and tool_hooks columns from agent_definitions...');

  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS hooks`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS tool_hooks`.execute(db);

  console.log('Done dropping hooks columns.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Re-adding hooks and tool_hooks columns to agent_definitions...');

  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS hooks JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS tool_hooks JSONB`.execute(db);

  console.log('Done re-adding hooks columns.');
}
