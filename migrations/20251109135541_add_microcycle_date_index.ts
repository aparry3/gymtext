import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  // Add composite index to optimize getMicrocycleByDate queries
  // This supports queries: WHERE user_id = X AND fitness_plan_id = Y AND start_date <= Z AND end_date >= Z
  await sql`
    CREATE INDEX IF NOT EXISTS idx_microcycles_date_lookup
    ON microcycles(user_id, fitness_plan_id, start_date, end_date)
  `.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Remove the index
  await sql`
    DROP INDEX IF EXISTS idx_microcycles_date_lookup
  `.execute(db);
}
