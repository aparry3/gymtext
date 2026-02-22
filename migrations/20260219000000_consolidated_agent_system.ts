import { Kysely, sql } from 'kysely';

/**
 * Consolidated Agent System Migration (IDEMPOTENT)
 *
 * This migration consolidates all agent system changes from the new-agent-system branch.
 * It creates the final state of the database schema for the agent-driven development features.
 *
 * IDEMPOTENT: This migration uses IF NOT EXISTS and conditional logic so it can run safely on:
 * - Fresh databases: Creates everything normally
 * - Existing databases: Handles already-existing columns/tables gracefully
 *
 * Changes from main branch:
 * - Creates agent_definitions table (append-only versioned agent configs)
 * - Adds WhatsApp/messaging columns to users table
 * - Simplifies fitness_plans and microcycles (dossier-based architecture)
 * - Simplifies agent_logs
 * - Adds week:format agent
 *
 * Tables created/modified:
 * - agent_definitions (NEW)
 * - users (MODIFIED - add messaging columns)
 * - fitness_plans (MODIFIED - simplify to content-based)
 * - microcycles (MODIFIED - simplify to content-based)
 * - profiles (MODIFIED - drop structured column)
 * - agent_logs (MODIFIED - drop eval columns)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting consolidated agent system migration...');

  // =============================================================================
  // 1. Create agent_definitions table
  // =============================================================================
  console.log('Creating agent_definitions table...');
  await sql`
    CREATE TABLE IF NOT EXISTS agent_definitions (
      version_id SERIAL PRIMARY KEY,
      agent_id TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT 'gpt-5-nano',
      max_tokens INTEGER DEFAULT 16000,
      temperature NUMERIC(3,2) DEFAULT 1.0,
      max_iterations INTEGER DEFAULT 5,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      tool_ids TEXT[],
      tool_hooks JSONB,
      hooks JSONB,
      user_prompt_template TEXT,
      eval_rubric TEXT
    )
  `.execute(db);

  // Create indexes (if not exists)
  await sql`
    CREATE INDEX IF NOT EXISTS idx_agent_definitions_agent_id_created
    ON agent_definitions (agent_id, created_at DESC)
  `.execute(db);

  await sql`
    CREATE INDEX IF NOT EXISTS idx_agent_definitions_active
    ON agent_definitions (is_active) WHERE is_active = true
  `.execute(db);

  // Add unique constraint on agent_id for upsert operations (use DROP + ADD for idempotency)
  await sql`ALTER TABLE agent_definitions DROP CONSTRAINT IF EXISTS uq_agent_definitions_agent_id`.execute(db);
  await sql`ALTER TABLE agent_definitions ADD CONSTRAINT uq_agent_definitions_agent_id UNIQUE (agent_id)`.execute(db);

  // =============================================================================
  // 2. Seed agent definitions (only if table is empty)
  // =============================================================================
  console.log('Seeding agent definitions...');
  
  const existingCount = await sql<{ count: string }>`
    SELECT COUNT(*) as count FROM agent_definitions
  `.execute(db);

  if (parseInt(existingCount.rows[0]?.count || '0') === 0) {
    // Define model configurations for each agent
    const modelConfigs: Record<string, { model: string; maxTokens: number; temperature: number; description: string }> = {
      // Chat
      'chat:generate': { model: 'gpt-5.1', maxTokens: 4000, temperature: 0.8, description: 'Main chat agent for conversational responses' },

      // Profile
      'profile:fitness': { model: 'gpt-5-nano', maxTokens: 8000, temperature: 0.5, description: 'Updates fitness profile dossier from user messages' },
      'profile:structured': { model: 'gpt-5-nano', maxTokens: 4000, temperature: 0.3, description: 'Extracts structured profile data' },
      'profile:user': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.3, description: 'Extracts user fields (timezone, send time, name)' },

      // Plans
      'plan:generate': { model: 'gpt-5.1', maxTokens: 8000, temperature: 0.7, description: 'Generates fitness plan architecture' },
      'plan:structured': { model: 'gpt-5-nano', maxTokens: 8000, temperature: 0.5, description: 'Structures fitness plan output' },
      'plan:message': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Generates plan-related messages' },
      'plan:modify': { model: 'gpt-5-mini', maxTokens: 8000, temperature: 0.6, description: 'Modifies existing fitness plans' },

      // Workouts
      'workout:generate': { model: 'gpt-5.1', maxTokens: 8000, temperature: 0.7, description: 'Generates workout for a specific day' },
      'workout:structured': { model: 'gpt-5-nano', maxTokens: 32000, temperature: 0.5, description: 'Structures workout into JSON format' },
      'workout:structured:validate': { model: 'gpt-5-nano', maxTokens: 4000, temperature: 0.3, description: 'Validates workout structure completeness' },
      'workout:message': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Formats workout as SMS message' },
      'workout:modify': { model: 'gpt-5-mini', maxTokens: 8000, temperature: 0.6, description: 'Modifies existing workouts' },

      // Weeks (formerly microcycles)
      'week:generate': { model: 'gpt-5.1', maxTokens: 8000, temperature: 0.7, description: 'Generates weekly training pattern' },
      'week:structured': { model: 'gpt-5-nano', maxTokens: 8000, temperature: 0.5, description: 'Structures week output' },
      'week:message': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Generates week messages' },
      'week:modify': { model: 'gpt-5-mini', maxTokens: 8000, temperature: 0.6, description: 'Modifies existing weeks' },

      // Modifications
      'modifications:router': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.3, description: 'Routes modification requests to appropriate handler' },

      // Programs
      'program:parse': { model: 'gpt-5.1', maxTokens: 16000, temperature: 0.5, description: 'Parses raw program text into structured markdown' },

      // Messaging
      'messaging:plan-summary': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Generates plan summary messages' },
      'messaging:plan-ready': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Generates plan ready notifications' },

      // Blog
      'blog:metadata': { model: 'gpt-5-nano', maxTokens: 1000, temperature: 0.5, description: 'Generates blog post metadata (title, description)' },
    };

    // Get prompts to seed from (only if prompts table exists)
    try {
      const promptPairs = await sql<{
        id: string;
        system_prompt: string;
        user_prompt: string | null;
      }>`
        SELECT
          p1.id,
          p1.value as system_prompt,
          p2.value as user_prompt
        FROM (
          SELECT DISTINCT ON (id) id, value
          FROM prompts
          WHERE role = 'system'
          ORDER BY id, created_at DESC
        ) p1
        LEFT JOIN (
          SELECT DISTINCT ON (id) id, value
          FROM prompts
          WHERE role = 'user'
          ORDER BY id, created_at DESC
        ) p2 ON p1.id = p2.id
        WHERE p1.id NOT LIKE '%:experience:%'
          AND p1.id NOT LIKE '%:format:%'
      `.execute(db);

      for (const row of promptPairs.rows) {
        const config = modelConfigs[row.id] || {
          model: 'gpt-5-nano',
          maxTokens: 16000,
          temperature: 1.0,
          description: `Agent for ${row.id}`,
        };

        await sql`
          INSERT INTO agent_definitions (agent_id, system_prompt, user_prompt_template, model, max_tokens, temperature, description)
          VALUES (
            ${row.id},
            ${row.system_prompt},
            ${row.user_prompt},
            ${config.model},
            ${config.maxTokens},
            ${config.temperature},
            ${config.description}
          )
        `.execute(db);

        console.log(`  Seeded agent: ${row.id}`);
      }
    } catch (e) {
      console.log('  Skipping prompt-based seeding (prompts table may not exist or be accessible)');
      
      // Seed basic agents without prompts
      for (const [agentId, config] of Object.entries(modelConfigs)) {
        await sql`
          INSERT INTO agent_definitions (agent_id, system_prompt, model, max_tokens, temperature, description)
          VALUES (
            ${agentId},
            ${`You are the ${agentId} agent.`},
            ${config.model},
            ${config.maxTokens},
            ${config.temperature},
            ${config.description}
          )
        `.execute(db);
        console.log(`  Seeded agent: ${agentId}`);
      }
    }

    // Seed chat:generate with tools
    await sql`
      UPDATE agent_definitions SET
        tool_ids = ARRAY['update_profile', 'make_modification', 'get_workout'],
        tool_hooks = '{"make_modification": {"preHook": {"hook": "sendMessage", "source": "args.message"}}}'::jsonb
      WHERE agent_id = 'chat:generate' AND is_active = true
    `.execute(db);

    // Seed modifications:router
    await sql`
      UPDATE agent_definitions SET
        tool_ids = ARRAY['modify_workout', 'modify_week', 'modify_plan']
      WHERE agent_id = 'modifications:router' AND is_active = true
    `.execute(db);

    // Seed week:format
    await sql`
      INSERT INTO agent_definitions (agent_id, system_prompt, model, max_tokens, temperature, description)
      VALUES (
        'week:format',
        ${'You are a fitness coaching assistant. Your job is to take a detailed training week plan (in markdown) and format it into a concise, motivating SMS message.\n\nGuidelines:\n- Keep the message brief and SMS-friendly (under 1500 characters)\n- Summarize each training day with the key focus (e.g., "Mon: Upper Body Push", "Tue: Rest")\n- Include a brief motivating opener\n- Use a clean, easy-to-read format\n- Do not include exercise-level details - just the day-by-day overview\n- If the user has a profile context, personalize the tone\n\nThe user message will contain the full week markdown content. Respond with ONLY the formatted SMS message, nothing else.'},
        'gpt-5-nano',
        2000,
        0.7,
        'Formats a markdown week dossier into an SMS-friendly weekly summary'
      )
    `.execute(db);
    console.log('  Seeded agent: week:format');
  } else {
    console.log('  Agent definitions already exist, skipping seed');
  }

  // =============================================================================
  // 3. Add messaging columns to users table
  // =============================================================================
  console.log('Adding messaging columns to users table...');
  
  // Check if users table exists and add columns if they don't exist
  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS preferred_messaging_provider VARCHAR(20) DEFAULT 'twilio'
  `.execute(db);

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS messaging_opt_in BOOLEAN DEFAULT FALSE
  `.execute(db);

  await sql`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS messaging_opt_in_date TIMESTAMPTZ
  `.execute(db);

  // Create index for messaging opt-in
  await sql`
    CREATE INDEX IF NOT EXISTS users_messaging_opt_in_idx
    ON users(messaging_opt_in)
    WHERE messaging_opt_in = TRUE
  `.execute(db);

  // Add index on messages provider
  await sql`
    CREATE INDEX IF NOT EXISTS messages_provider_idx
    ON messages(provider)
  `.execute(db);

  // =============================================================================
  // 4. Simplify profiles table (drop structured column)
  // =============================================================================
  console.log('Simplifying profiles table...');
  await sql`ALTER TABLE profiles DROP COLUMN IF EXISTS structured`.execute(db);

  // =============================================================================
  // 5. Simplify fitness_plans table (dossier-based)
  // =============================================================================
  console.log('Simplifying fitness_plans table...');

  // Add content column if not exists
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);

  // Migrate existing description to content if content is null (only if description column exists)
  const fitnessPlansDescExists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'fitness_plans' AND column_name = 'description'
    ) as exists
  `.execute(db);
  
  if (fitnessPlansDescExists.rows[0]?.exists) {
    await sql`UPDATE fitness_plans SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);
  }

  // Drop unused columns (may not exist on older databases)
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS current_state`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS personalization_snapshot`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_version_id`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS status`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS published_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS program_id`.execute(db);

  // Add index for latest plan per user
  await sql`CREATE INDEX IF NOT EXISTS idx_fitness_plans_user_latest ON fitness_plans(client_id, created_at DESC)`.execute(db);

  // =============================================================================
  // 6. Simplify microcycles table (dossier-based)
  // =============================================================================
  console.log('Simplifying microcycles table...');

  // Add new columns
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS content TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES fitness_plans(id)`.execute(db);

  // Migrate existing description to content (only if description column exists)
  const microcyclesDescExists = await sql<{ exists: boolean }>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'microcycles' AND column_name = 'description'
    ) as exists
  `.execute(db);
  
  if (microcyclesDescExists.rows[0]?.exists) {
    await sql`UPDATE microcycles SET content = description WHERE content IS NULL AND description IS NOT NULL`.execute(db);
  }

  // Drop unused columns
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS absolute_week`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS days`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS description`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS message`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS structured`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS is_active`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS updated_at`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS end_date`.execute(db);

  // Add indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_latest ON microcycles(client_id, created_at DESC)`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS idx_microcycles_user_date ON microcycles(client_id, start_date DESC)`.execute(db);

  // =============================================================================
  // 7. Simplify agent_logs (drop eval columns)
  // =============================================================================
  console.log('Simplifying agent_logs table...');
  
  // Truncate first (as per original migration - schema is incompatible)
  await sql`TRUNCATE TABLE agent_logs`.execute(db);

  // Drop eval columns if they exist
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_result`.execute(db);
  await sql`ALTER TABLE agent_logs DROP COLUMN IF EXISTS eval_score`.execute(db);

  console.log('Consolidated agent system migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back consolidated agent system migration...');

  // =============================================================================
  // 1. Drop agent_definitions
  // =============================================================================
  console.log('Dropping agent_definitions table...');
  await sql`DROP INDEX IF EXISTS idx_agent_definitions_agent_id_created`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_agent_definitions_active`.execute(db);
  await sql`DROP TABLE IF EXISTS agent_definitions`.execute(db);

  // =============================================================================
  // 2. Remove messaging columns from users
  // =============================================================================
  console.log('Removing messaging columns from users...');
  await sql`DROP INDEX IF EXISTS users_messaging_opt_in_idx`.execute(db);
  await sql`DROP INDEX IF EXISTS messages_provider_idx`.execute(db);

  await sql`ALTER TABLE users DROP COLUMN IF EXISTS preferred_messaging_provider`.execute(db);
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS messaging_opt_in`.execute(db);
  await sql`ALTER TABLE users DROP COLUMN IF EXISTS messaging_opt_in_date`.execute(db);

  // =============================================================================
  // 3. Restore profiles structured column
  // =============================================================================
  console.log('Restoring profiles table...');
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);

  // =============================================================================
  // 4. Restore fitness_plans columns
  // =============================================================================
  console.log('Restoring fitness_plans table...');
  await sql`DROP INDEX IF EXISTS idx_fitness_plans_user_latest`.execute(db);

  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS current_state JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS personalization_snapshot JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS program_version_id UUID`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS message TEXT`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN IF NOT EXISTS program_id UUID`.execute(db);

  // Migrate content back to description
  await sql`UPDATE fitness_plans SET description = content WHERE description IS NULL AND content IS NOT NULL`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN IF EXISTS content`.execute(db);

  // =============================================================================
  // 5. Restore microcycles columns
  // =============================================================================
  console.log('Restoring microcycles table...');
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_latest`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_microcycles_user_date`.execute(db);

  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS absolute_week INTEGER`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS days TEXT[]`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS description TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS message TEXT`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS structured JSONB`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP`.execute(db);
  await sql`ALTER TABLE microcycles ADD COLUMN IF NOT EXISTS end_date DATE`.execute(db);

  // Migrate content back to description
  await sql`UPDATE microcycles SET description = content WHERE description IS NULL AND content IS NOT NULL`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS content`.execute(db);
  await sql`ALTER TABLE microcycles DROP COLUMN IF EXISTS plan_id`.execute(db);

  // =============================================================================
  // 6. Restore agent_logs columns
  // =============================================================================
  console.log('Restoring agent_logs table...');
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_result JSONB`.execute(db);
  await sql`ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS eval_score NUMERIC(5,2)`.execute(db);

  console.log('Rollback complete!');
}
