import { Kysely, sql } from 'kysely';

/**
 * Expand Agent Extensions Migration
 *
 * Evolves the agent_extensions table from a simple content/eval_rubric store
 * into a full agent-override surface. New columns mirror agent_definitions
 * fields so that extensions can override or append to any aspect of an agent.
 *
 * Data migration:
 *   - content  → system_prompt  (with system_prompt_mode = 'append')
 *   - eval_rubric → eval_prompt (with eval_prompt_mode = 'append')
 *
 * Old columns (content, eval_rubric) are dropped after data is migrated.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // =========================================================================
  // 1. Add new columns
  // =========================================================================
  console.log('Adding new columns to agent_extensions...');

  await sql`ALTER TABLE agent_extensions ADD COLUMN system_prompt TEXT`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN system_prompt_mode TEXT DEFAULT 'append'`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN user_prompt_template TEXT`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN user_prompt_template_mode TEXT DEFAULT 'append'`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN eval_prompt TEXT`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN eval_prompt_mode TEXT DEFAULT 'append'`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN model TEXT`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN temperature NUMERIC`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN max_tokens INTEGER`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN max_iterations INTEGER`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN max_retries INTEGER`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN tool_ids TEXT[]`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN context_types TEXT[]`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN schema_json JSONB`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN validation_rules JSONB`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN sub_agents JSONB`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN examples JSONB`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN trigger_conditions JSONB`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN description TEXT`.execute(db);

  console.log('New columns added.');

  // =========================================================================
  // 2. Migrate data from old columns to new columns
  // =========================================================================
  console.log('Migrating data from content → system_prompt...');
  await sql`
    UPDATE agent_extensions
    SET system_prompt = content, system_prompt_mode = 'append'
    WHERE content IS NOT NULL
  `.execute(db);

  console.log('Migrating data from eval_rubric → eval_prompt...');
  await sql`
    UPDATE agent_extensions
    SET eval_prompt = eval_rubric, eval_prompt_mode = 'append'
    WHERE eval_rubric IS NOT NULL
  `.execute(db);

  // =========================================================================
  // 3. Drop old columns
  // =========================================================================
  console.log('Dropping old columns (content, eval_rubric)...');
  await sql`ALTER TABLE agent_extensions DROP COLUMN content`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN eval_rubric`.execute(db);

  console.log('Migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back expand_agent_extensions migration...');

  // =========================================================================
  // 1. Re-add old columns
  // =========================================================================
  await sql`ALTER TABLE agent_extensions ADD COLUMN content TEXT`.execute(db);
  await sql`ALTER TABLE agent_extensions ADD COLUMN eval_rubric TEXT`.execute(db);

  // =========================================================================
  // 2. Migrate data back
  // =========================================================================
  console.log('Migrating data from system_prompt → content...');
  await sql`
    UPDATE agent_extensions
    SET content = system_prompt
    WHERE system_prompt IS NOT NULL
  `.execute(db);

  console.log('Migrating data from eval_prompt → eval_rubric...');
  await sql`
    UPDATE agent_extensions
    SET eval_rubric = eval_prompt
    WHERE eval_prompt IS NOT NULL
  `.execute(db);

  // =========================================================================
  // 3. Drop new columns
  // =========================================================================
  console.log('Dropping new columns...');
  await sql`ALTER TABLE agent_extensions DROP COLUMN system_prompt`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN system_prompt_mode`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN user_prompt_template`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN user_prompt_template_mode`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN eval_prompt`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN eval_prompt_mode`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN model`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN temperature`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN max_tokens`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN max_iterations`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN max_retries`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN tool_ids`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN context_types`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN schema_json`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN validation_rules`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN sub_agents`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN examples`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN trigger_conditions`.execute(db);
  await sql`ALTER TABLE agent_extensions DROP COLUMN description`.execute(db);

  console.log('Rollback complete!');
}
