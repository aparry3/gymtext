import { Kysely, sql } from 'kysely';

/**
 * Agent Eval System Migration
 *
 * Part 1: Creates the agent_logs table for storing every agent invocation
 * (full message chain + response) for review and debugging.
 *
 * Part 2: Adds an examples JSONB column to agent_definitions for
 * few-shot and negative examples injected into the message chain.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting agent eval system migration...');

  // Part 1: agent_logs table
  console.log('Creating agent_logs table...');
  await sql`
    CREATE TABLE agent_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      agent_id TEXT NOT NULL,
      model TEXT,
      messages JSONB NOT NULL,
      input TEXT,
      response JSONB,
      duration_ms INTEGER,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  await sql`
    CREATE INDEX idx_agent_logs_agent_id ON agent_logs(agent_id)
  `.execute(db);

  await sql`
    CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at)
  `.execute(db);

  // Part 2: examples column on agent_definitions
  console.log('Adding examples column to agent_definitions...');
  await sql`
    ALTER TABLE agent_definitions ADD COLUMN IF NOT EXISTS examples JSONB
  `.execute(db);

  console.log('Agent eval system migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back agent eval system migration...');

  await sql`DROP INDEX IF EXISTS idx_agent_logs_agent_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_agent_logs_created_at`.execute(db);
  await sql`DROP TABLE IF EXISTS agent_logs`.execute(db);
  await sql`ALTER TABLE agent_definitions DROP COLUMN IF EXISTS examples`.execute(db);

  console.log('Agent eval system rollback complete!');
}
