import { Kysely, sql } from 'kysely';

/**
 * Fix modify agent context types
 *
 * workout:modify was missing recentWorkouts — the agent needs to see what
 * the user has done recently to make informed modifications.
 *
 * microcycle:modify was missing fitnessPlan and recentWorkouts — the agent
 * needs the overall plan context and recent workout history to restructure
 * the week intelligently.
 *
 * Both are append-only (new version inserted).
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // workout:modify: add recentWorkouts + dateContext
  console.log('Updating workout:modify context_types...');
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model, default_extensions
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids,
      ARRAY['userProfile', 'currentWorkout', 'recentWorkouts', 'dateContext'],
      schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model, default_extensions
    FROM agent_definitions
    WHERE agent_id = 'workout:modify'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  workout:modify now includes recentWorkouts + dateContext');

  // microcycle:modify: add fitnessPlan + recentWorkouts
  console.log('Updating microcycle:modify context_types...');
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model, default_extensions
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids,
      ARRAY['user', 'userProfile', 'currentMicrocycle', 'dateContext', 'fitnessPlan', 'recentWorkouts'],
      schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model, default_extensions
    FROM agent_definitions
    WHERE agent_id = 'microcycle:modify'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  microcycle:modify now includes fitnessPlan + recentWorkouts');

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Remove the latest versions we just inserted
  console.log('Rolling back modify agent context_types...');

  await sql`
    DELETE FROM agent_definitions
    WHERE version_id = (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'workout:modify'
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  await sql`
    DELETE FROM agent_definitions
    WHERE version_id = (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'microcycle:modify'
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  console.log('Rollback complete!');
}
