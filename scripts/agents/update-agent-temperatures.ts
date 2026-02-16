/**
 * Update Agent Temperatures
 *
 * Updates all agent_definitions in the dev (sandbox) database to have temperature = 1.
 * Run: npx tsx scripts/update-agent-temperatures.ts
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';

async function main() {
  const connectionString = process.env.SANDBOX_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: SANDBOX_DATABASE_URL or DATABASE_URL must be set');
    process.exit(1);
  }

  console.log('Connecting to database...');

  const db = new Kysely<unknown>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString }),
    }),
  });

  try {
    // Update all agent_definitions to temperature = 1
    const result = await sql`
      UPDATE agent_definitions
      SET temperature = 1.0
    `.execute(db);

    console.log(`Updated ${(result as any).numAffectedRows ?? 'all'} agent definitions to temperature = 1.0`);

    // Verify the update
    const agents = await sql<{ agent_id: string; temperature: number }>`
      SELECT agent_id, temperature
      FROM agent_definitions
      ORDER BY agent_id, created_at DESC
    `.execute(db);

    console.log('\nCurrent agent temperatures:');
    for (const agent of agents.rows) {
      console.log(`  ${agent.agent_id}: ${agent.temperature}`);
    }
  } catch (error) {
    console.error('Error updating agents:', error);
    process.exit(1);
  } finally {
    await db.destroy();
    console.log('\nDone.');
  }
}

main();
