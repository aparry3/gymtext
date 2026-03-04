import { Kysely, sql } from 'kysely';

/**
 * Add eval columns to agent_logs table for the automated scoring system.
 *
 * Columns:
 * - eval_result: Structured eval result (dimensions, scores, notes)
 * - eval_score: Overall weighted score (0-10) for easy querying/sorting
 */
export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Adding eval columns to agent_logs...');

  await sql`
    ALTER TABLE agent_logs
      ADD COLUMN IF NOT EXISTS eval_result JSONB,
      ADD COLUMN IF NOT EXISTS eval_score NUMERIC(4,2)
  `.execute(db);

  // Index for querying by eval score (find low-scoring logs, unscored logs)
  await sql`
    CREATE INDEX IF NOT EXISTS idx_agent_logs_eval_score
    ON agent_logs(eval_score)
    WHERE eval_score IS NOT NULL
  `.execute(db);

  console.log('Eval columns added to agent_logs.');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Removing eval columns from agent_logs...');

  await sql`DROP INDEX IF EXISTS idx_agent_logs_eval_score`.execute(db);

  await sql`
    ALTER TABLE agent_logs
      DROP COLUMN IF EXISTS eval_result,
      DROP COLUMN IF EXISTS eval_score
  `.execute(db);

  console.log('Eval columns removed from agent_logs.');
}
