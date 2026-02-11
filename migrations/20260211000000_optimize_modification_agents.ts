import { Kysely, sql } from 'kysely';

/**
 * Optimize workout:modify agent
 *
 * Remove sub_agents from workout:modify since the service layer now
 * calls workout:message and workout:structured explicitly in parallel.
 *
 * This is an append-only table, so we insert a new version with sub_agents = NULL.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Inserting new workout:modify version without sub_agents...');

  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, NULL as sub_agents
    FROM agent_definitions
    WHERE agent_id = 'workout:modify'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);

  console.log('Done. workout:modify now has no sub_agents.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back: removing latest workout:modify version...');

  await sql`
    DELETE FROM agent_definitions
    WHERE version_id = (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'workout:modify'
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  console.log('Done. Rolled back workout:modify to previous version.');
}
