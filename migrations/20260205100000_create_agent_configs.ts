import { Kysely, sql } from 'kysely';

/**
 * Agent Configs Migration
 *
 * Creates the agent_configs table to store unified agent configuration:
 * - System and user prompts (migrated from prompts table)
 * - Model configuration (model ID, temperature, max tokens, max iterations)
 *
 * Uses a versioned insert-only design (composite primary key on id + created_at)
 * for audit trail and rollback capability.
 *
 * Context prompts remain in the existing prompts table and are fetched
 * dynamically at runtime via PromptService.getContextPrompt().
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting agent_configs migration...');

  // Create agent_configs table
  console.log('Creating agent_configs table...');
  await sql`
    CREATE TABLE agent_configs (
      id TEXT NOT NULL,

      -- Prompts (system + user only; context stays in prompts table)
      system_prompt TEXT NOT NULL,
      user_prompt TEXT,

      -- Model config (null = use defaults)
      model TEXT,
      temperature NUMERIC,
      max_tokens INTEGER,
      max_iterations INTEGER,

      -- Versioning
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

      -- Composite primary key for versioning
      PRIMARY KEY (id, created_at)
    )
  `.execute(db);

  // Create index for fetching latest config by id
  console.log('Creating index for latest config lookup...');
  await sql`
    CREATE INDEX idx_agent_configs_id_latest ON agent_configs (id, created_at DESC)
  `.execute(db);

  // Migrate existing system + user prompts from prompts table
  // Pivots rows into columns, taking most recent of each role
  console.log('Migrating existing prompts to agent_configs...');
  await sql`
    INSERT INTO agent_configs (id, system_prompt, user_prompt)
    SELECT
      id,
      MAX(CASE WHEN role = 'system' THEN value END) as system_prompt,
      MAX(CASE WHEN role = 'user' THEN value END) as user_prompt
    FROM (
      SELECT DISTINCT ON (id, role) id, role, value
      FROM prompts
      WHERE role IN ('system', 'user')
      ORDER BY id, role, created_at DESC
    ) latest_prompts
    GROUP BY id
    HAVING MAX(CASE WHEN role = 'system' THEN value END) IS NOT NULL
  `.execute(db);

  // Log count of migrated configs
  const result = await sql<{ count: number }>`
    SELECT COUNT(*) as count FROM agent_configs
  `.execute(db);
  console.log(`Migrated ${result.rows[0]?.count ?? 0} agent configs from prompts table`);

  console.log('Agent configs migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back agent_configs migration...');

  // Drop index first
  console.log('Dropping index...');
  await sql`DROP INDEX IF EXISTS idx_agent_configs_id_latest`.execute(db);

  // Drop table
  console.log('Dropping agent_configs table...');
  await sql`DROP TABLE IF EXISTS agent_configs`.execute(db);

  // Note: We do NOT delete from prompts table - data stays for safety

  console.log('Agent configs rollback complete!');
}
