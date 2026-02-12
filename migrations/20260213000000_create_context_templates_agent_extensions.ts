import { Kysely, sql } from 'kysely';

/**
 * Context Templates & Agent Extensions Migration
 *
 * Creates two new tables for the registry system:
 *
 * 1. context_templates - Stores display templates for context providers.
 *    Append-only versioned by (context_type, variant, created_at DESC).
 *
 * 2. agent_extensions - Stores per-agent content extensions (experience level
 *    snippets, day format rules, etc.) previously kept in the prompts table.
 *    Append-only versioned by (agent_id, extension_type, extension_key, created_at DESC).
 *
 * Also updates agent_definitions to remove experienceLevel from context_types
 * for workout:generate and microcycle:generate (those will use extensions instead).
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // =========================================================================
  // 1. Create context_templates table
  // =========================================================================
  console.log('Creating context_templates table...');
  await sql`
    CREATE TABLE context_templates (
      context_type TEXT NOT NULL,
      variant TEXT NOT NULL DEFAULT 'default',
      template TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    CREATE INDEX idx_ct_type_variant_created
      ON context_templates (context_type, variant, created_at DESC)
  `.execute(db);

  // Seed default templates
  console.log('Seeding context templates...');
  const templates: Array<{ contextType: string; template: string }> = [
    { contextType: 'user', template: '<User>\n{{content}}\n</User>' },
    { contextType: 'userProfile', template: '<UserProfile>{{content}}</UserProfile>' },
    { contextType: 'dateContext', template: '<DateContext>\nToday is {{formattedDate}}.\nTimezone: {{timezone}}\n</DateContext>' },
    { contextType: 'fitnessPlan', template: '<FitnessPlan>{{content}}</FitnessPlan>' },
    { contextType: 'dayOverview', template: '<DayOverview>{{content}}</DayOverview>' },
    { contextType: 'currentWorkout', template: '<CurrentWorkout>{{content}}</CurrentWorkout>' },
    { contextType: 'trainingMeta', template: '<TrainingMeta>{{content}}</TrainingMeta>' },
    { contextType: 'currentMicrocycle', template: '<CurrentMicrocycle>\n{{content}}\n</CurrentMicrocycle>' },
    { contextType: 'programVersion', template: '<ProgramVersion>\n{{content}}\n</ProgramVersion>' },
    { contextType: 'availableExercises', template: '<AvailableExercises>\n{{content}}\n</AvailableExercises>' },
  ];

  for (const t of templates) {
    await sql`
      INSERT INTO context_templates (context_type, variant, template)
      VALUES (${t.contextType}, 'default', ${t.template})
    `.execute(db);
    console.log(`  Seeded template: ${t.contextType}`);
  }

  // =========================================================================
  // 2. Create agent_extensions table
  // =========================================================================
  console.log('Creating agent_extensions table...');
  await sql`
    CREATE TABLE agent_extensions (
      agent_id TEXT NOT NULL,
      extension_type TEXT NOT NULL,
      extension_key TEXT NOT NULL,
      content TEXT NOT NULL,
      eval_rubric TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    CREATE INDEX idx_ae_agent_type_key_created
      ON agent_extensions (agent_id, extension_type, extension_key, created_at DESC)
  `.execute(db);

  // Seed agent_extensions from prompts table
  console.log('Seeding agent_extensions from prompts...');

  // Experience level extensions for workout:generate
  const workoutExperiencePromptIds: Array<{ key: string; promptId: string }> = [
    { key: 'beginner', promptId: 'workout:generate:experience:beginner' },
    { key: 'intermediate', promptId: 'workout:generate:experience:intermediate' },
    { key: 'advanced', promptId: 'workout:generate:experience:advanced' },
  ];

  for (const { key, promptId } of workoutExperiencePromptIds) {
    await sql`
      INSERT INTO agent_extensions (agent_id, extension_type, extension_key, content)
      SELECT
        'workout:generate',
        'experienceLevel',
        ${key},
        p.value
      FROM (
        SELECT value FROM prompts
        WHERE id = ${promptId} AND role = 'context'
        ORDER BY created_at DESC
        LIMIT 1
      ) p
    `.execute(db);
    console.log(`  Seeded workout:generate experienceLevel ${key}`);
  }

  // Experience level extensions for microcycle:generate
  const microcycleExperiencePromptIds: Array<{ key: string; promptId: string }> = [
    { key: 'beginner', promptId: 'microcycle:generate:experience:beginner' },
    { key: 'intermediate', promptId: 'microcycle:generate:experience:intermediate' },
    { key: 'advanced', promptId: 'microcycle:generate:experience:advanced' },
  ];

  for (const { key, promptId } of microcycleExperiencePromptIds) {
    await sql`
      INSERT INTO agent_extensions (agent_id, extension_type, extension_key, content)
      SELECT
        'microcycle:generate',
        'experienceLevel',
        ${key},
        p.value
      FROM (
        SELECT value FROM prompts
        WHERE id = ${promptId} AND role = 'context'
        ORDER BY created_at DESC
        LIMIT 1
      ) p
    `.execute(db);
    console.log(`  Seeded microcycle:generate experienceLevel ${key}`);
  }

  // Day format extensions for workout:generate
  const dayFormatPromptIds: Array<{ key: string; promptId: string }> = [
    { key: 'TRAINING', promptId: 'workout:message:format:training' },
    { key: 'ACTIVE_RECOVERY', promptId: 'workout:message:format:active_recovery' },
    { key: 'REST', promptId: 'workout:message:format:rest' },
  ];

  for (const { key, promptId } of dayFormatPromptIds) {
    await sql`
      INSERT INTO agent_extensions (agent_id, extension_type, extension_key, content)
      SELECT
        'workout:generate',
        'dayFormat',
        ${key},
        p.value
      FROM (
        SELECT value FROM prompts
        WHERE id = ${promptId} AND role = 'context'
        ORDER BY created_at DESC
        LIMIT 1
      ) p
    `.execute(db);
    console.log(`  Seeded workout:generate dayFormat ${key}`);
  }

  // =========================================================================
  // 3. Update agent_definitions: remove experienceLevel from context_types
  // =========================================================================
  console.log('Updating agent_definitions to remove experienceLevel from context_types...');

  // Insert new version for workout:generate without experienceLevel
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids,
      ARRAY['userProfile', 'dayOverview', 'trainingMeta'],
      schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model
    FROM agent_definitions
    WHERE agent_id = 'workout:generate'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  Updated workout:generate context_types');

  // Insert new version for microcycle:generate without experienceLevel
  await sql`
    INSERT INTO agent_definitions (
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids, context_types, schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model
    )
    SELECT
      agent_id, system_prompt, user_prompt, model,
      temperature, max_tokens, max_iterations, max_retries,
      description, is_active,
      tool_ids,
      ARRAY['fitnessPlan', 'userProfile', 'trainingMeta'],
      schema_json, validation_rules,
      user_prompt_template, examples, sub_agents,
      eval_prompt, eval_model
    FROM agent_definitions
    WHERE agent_id = 'microcycle:generate'
    ORDER BY created_at DESC
    LIMIT 1
  `.execute(db);
  console.log('  Updated microcycle:generate context_types');

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back context_templates and agent_extensions migration...');

  // Restore experienceLevel in context_types for workout:generate
  await sql`
    DELETE FROM agent_definitions
    WHERE version_id = (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'workout:generate'
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  // Restore experienceLevel in context_types for microcycle:generate
  await sql`
    DELETE FROM agent_definitions
    WHERE version_id = (
      SELECT version_id FROM agent_definitions
      WHERE agent_id = 'microcycle:generate'
      ORDER BY created_at DESC
      LIMIT 1
    )
  `.execute(db);

  // Drop agent_extensions
  await sql`DROP INDEX IF EXISTS idx_ae_agent_type_key_created`.execute(db);
  await sql`DROP TABLE IF EXISTS agent_extensions`.execute(db);

  // Drop context_templates
  await sql`DROP INDEX IF EXISTS idx_ct_type_variant_created`.execute(db);
  await sql`DROP TABLE IF EXISTS context_templates`.execute(db);

  console.log('Rollback complete!');
}
