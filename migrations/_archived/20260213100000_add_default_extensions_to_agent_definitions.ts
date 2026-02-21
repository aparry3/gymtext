import { Kysely, sql } from 'kysely';

/**
 * Add default_extensions column to agent_definitions
 *
 * Allows agent definitions to declare default extension keys per type.
 * For example: { "experienceLevel": "intermediate", "dayFormat": "TRAINING" }
 *
 * Resolution order in AgentRunner:
 * 1. Start with default_extensions from agent definition
 * 2. Merge caller-provided params.extensions on top (caller overrides defaults)
 * 3. Resolve each merged extension type/key via agentExtensionService
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  // 1. Add column
  console.log('Adding default_extensions column to agent_definitions...');
  await sql`
    ALTER TABLE agent_definitions
    ADD COLUMN default_extensions JSONB DEFAULT NULL
  `.execute(db);

  // 2. Seed new versions for workout:generate with default_extensions
  console.log('Seeding workout:generate with default_extensions...');
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model,
      default_extensions
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model,
      '{"experienceLevel": "intermediate", "dayFormat": "TRAINING"}'::jsonb
    FROM agent_definitions
    WHERE agent_id = 'workout:generate'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  Seeded workout:generate default_extensions');

  // 3. Seed new versions for week:generate with default_extensions
  console.log('Seeding week:generate with default_extensions...');
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model,
      default_extensions
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model,
      '{"experienceLevel": "intermediate"}'::jsonb
    FROM agent_definitions
    WHERE agent_id = 'week:generate'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  Seeded week:generate default_extensions');

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back default_extensions migration...');

  // Remove the seeded versions (latest for each agent with default_extensions set)
  await sql`
    DELETE FROM agent_definitions
    WHERE version_id IN (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'workout:generate' AND default_extensions IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  await sql`
    DELETE FROM agent_definitions
    WHERE version_id IN (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'week:generate' AND default_extensions IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  // Drop the column
  await sql`
    ALTER TABLE agent_definitions DROP COLUMN IF EXISTS default_extensions
  `.execute(db);

  console.log('Rollback complete!');
}
