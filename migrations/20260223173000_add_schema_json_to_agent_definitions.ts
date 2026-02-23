import { Migration, sql } from 'kysely';

/**
 * Add schema_json column to agent_definitions table.
 * Stores JSON Schema for agents that produce structured output.
 */
export const up: Migration = async (db) => {
  await sql`
    ALTER TABLE agent_definitions
    ADD COLUMN IF NOT EXISTS schema_json JSONB
  `.execute(db);
};

export const down: Migration = async (db) => {
  await sql`
    ALTER TABLE agent_definitions
    DROP COLUMN IF EXISTS schema_json
  `.execute(db);
};
