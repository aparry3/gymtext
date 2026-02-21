import { Kysely, sql } from 'kysely';

/**
 * Drop unused tables after dossier refactor.
 *
 * Tables removed:
 * - agent_extensions (replaced by simplified agent_definitions)
 * - context_templates (context registry removed)
 * - workout_instances (replaced by week dossier; will re-add for tracking later)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Dropping unused tables...');

  await sql`DROP TABLE IF EXISTS agent_extensions CASCADE`.execute(db);
  console.log('  Dropped agent_extensions');

  await sql`DROP TABLE IF EXISTS context_templates CASCADE`.execute(db);
  console.log('  Dropped context_templates');

  await sql`DROP TABLE IF EXISTS workout_instances CASCADE`.execute(db);
  console.log('  Dropped workout_instances');

  console.log('Done dropping unused tables.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Recreating dropped tables...');

  await sql`
    CREATE TABLE agent_extensions (
      agent_id TEXT NOT NULL,
      extension_type TEXT NOT NULL,
      extension_key TEXT NOT NULL,
      system_prompt TEXT,
      system_prompt_mode TEXT DEFAULT 'append',
      user_prompt_template TEXT,
      user_prompt_template_mode TEXT DEFAULT 'append',
      eval_prompt TEXT,
      eval_prompt_mode TEXT DEFAULT 'append',
      model TEXT,
      max_tokens INTEGER,
      temperature NUMERIC(3,2),
      max_iterations INTEGER,
      max_retries INTEGER,
      tool_ids TEXT[],
      context_types TEXT[],
      sub_agents JSONB,
      schema_json JSONB,
      validation_rules JSONB,
      examples JSONB,
      trigger_conditions JSONB,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (agent_id, extension_type, extension_key)
    )
  `.execute(db);

  await sql`
    CREATE TABLE context_templates (
      context_type TEXT NOT NULL,
      variant TEXT NOT NULL DEFAULT 'default',
      template TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (context_type, variant)
    )
  `.execute(db);

  await sql`
    CREATE TABLE workout_instances (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      client_id UUID NOT NULL REFERENCES users(id),
      microcycle_id UUID REFERENCES microcycles(id),
      date DATE NOT NULL,
      session_type TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      reasoning TEXT,
      message TEXT,
      details JSONB NOT NULL DEFAULT '{}',
      structured JSONB,
      tags TEXT[] NOT NULL DEFAULT '{}',
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`CREATE INDEX idx_workout_instances_tags ON workout_instances USING GIN (tags)`.execute(db);

  console.log('Done recreating tables.');
}
