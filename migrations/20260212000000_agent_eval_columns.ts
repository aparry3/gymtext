import { Kysely, sql } from 'kysely';

/**
 * Add eval configuration to agent_definitions and eval result columns to agent_logs.
 *
 * agent_definitions gains:
 *   - eval_prompt: rubric/system prompt for the eval LLM call
 *   - eval_model: model to use for eval (defaults to gpt-5-nano)
 *
 * agent_logs gains:
 *   - eval_result: full JSON response from the eval LLM
 *   - eval_score: numeric score extracted from eval response
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding eval columns to agent_definitions and agent_logs...');

  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS eval_prompt TEXT`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS eval_model TEXT DEFAULT 'gpt-5-nano'`.execute(db);

  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_result JSONB`.execute(db);
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_score NUMERIC(4,2)`.execute(db);

  console.log('Done adding eval columns.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing eval columns from agent_definitions and agent_logs...');

  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS eval_prompt`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS eval_model`.execute(db);

  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_result`.execute(db);
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_score`.execute(db);

  console.log('Done removing eval columns.');
}
