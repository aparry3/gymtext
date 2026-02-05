import { Kysely, sql } from 'kysely';

/**
 * Agent Definitions Migration
 *
 * Creates the agent_definitions table for database-driven agent configuration.
 * This table stores agent metadata (model, temperature, max tokens, etc.) alongside prompts.
 * Seeds initial data from existing prompts table with default model configs.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting agent definitions migration...');

  // Create agent_definitions table
  console.log('Creating agent_definitions table...');
  await sql`
    CREATE TABLE agent_definitions (
      id TEXT PRIMARY KEY,
      system_prompt TEXT NOT NULL,
      user_prompt TEXT,
      model TEXT NOT NULL DEFAULT 'gpt-5-nano',
      max_tokens INTEGER DEFAULT 16000,
      temperature NUMERIC(3,2) DEFAULT 1.0,
      max_iterations INTEGER DEFAULT 5,
      max_retries INTEGER DEFAULT 1,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create indexes
  console.log('Creating indexes...');
  await sql`
    CREATE INDEX idx_agent_definitions_active ON agent_definitions (is_active) WHERE is_active = true
  `.execute(db);

  // Create trigger for updated_at
  console.log('Creating updated_at trigger...');
  await sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_agent_definitions_updated_at') THEN
        CREATE TRIGGER update_agent_definitions_updated_at
        BEFORE UPDATE ON agent_definitions
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      END IF;
    END $$
  `.execute(db);

  // Seed agent definitions from existing prompts table
  console.log('Seeding agent definitions from prompts...');

  // Get all unique prompt IDs with their system and user prompts
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

    // Microcycles
    'microcycle:generate': { model: 'gpt-5.1', maxTokens: 8000, temperature: 0.7, description: 'Generates weekly training pattern' },
    'microcycle:structured': { model: 'gpt-5-nano', maxTokens: 8000, temperature: 0.5, description: 'Structures microcycle output' },
    'microcycle:message': { model: 'gpt-5-nano', maxTokens: 2000, temperature: 0.7, description: 'Generates microcycle messages' },
    'microcycle:modify': { model: 'gpt-5-mini', maxTokens: 8000, temperature: 0.6, description: 'Modifies existing microcycles' },

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

  // Insert each prompt pair as an agent definition
  for (const row of promptPairs.rows) {
    const config = modelConfigs[row.id] || {
      model: 'gpt-5-nano',
      maxTokens: 16000,
      temperature: 1.0,
      description: `Agent for ${row.id}`,
    };

    await sql`
      INSERT INTO agent_definitions (id, system_prompt, user_prompt, model, max_tokens, temperature, description)
      VALUES (
        ${row.id},
        ${row.system_prompt},
        ${row.user_prompt},
        ${config.model},
        ${config.maxTokens},
        ${config.temperature},
        ${config.description}
      )
      ON CONFLICT (id) DO UPDATE SET
        system_prompt = EXCLUDED.system_prompt,
        user_prompt = EXCLUDED.user_prompt,
        updated_at = CURRENT_TIMESTAMP
    `.execute(db);

    console.log(`  Seeded agent: ${row.id}`);
  }

  console.log('Agent definitions migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back agent definitions migration...');

  // Drop trigger first
  console.log('Dropping trigger...');
  await sql`DROP TRIGGER IF EXISTS update_agent_definitions_updated_at ON agent_definitions`.execute(db);

  // Drop indexes
  console.log('Dropping indexes...');
  await sql`DROP INDEX IF EXISTS idx_agent_definitions_active`.execute(db);

  // Drop table
  console.log('Dropping agent_definitions table...');
  await sql`DROP TABLE IF EXISTS agent_definitions`.execute(db);

  console.log('Agent definitions rollback complete!');
}
