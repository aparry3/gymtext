import { Kysely, sql } from 'kysely';

/**
 * Simplify Agent Definitions Migration
 *
 * Adds eval_rubric and drops columns that are no longer needed
 * in the simplified agent architecture.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Simplifying agent_definitions table...');

  // Add eval_rubric column
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS eval_rubric TEXT`.execute(db);

  // Drop columns no longer needed
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS user_prompt`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS max_retries`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS context_types`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS sub_agents`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS schema_json`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS validation_rules`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS default_extensions`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS eval_prompt`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS eval_model`.execute(db);

  console.log('Agent definitions simplification complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back agent_definitions simplification...');

  // Restore dropped columns
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS user_prompt TEXT`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 1`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS context_types TEXT[]`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS sub_agents JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS schema_json JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS validation_rules JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS default_extensions JSONB`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS eval_prompt TEXT`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS eval_model TEXT DEFAULT 'gpt-5-nano'`.execute(db);

  // Drop new column
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS eval_rubric`.execute(db);

  console.log('Agent definitions rollback complete!');
}
