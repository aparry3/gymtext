/**
 * Seed Exercise Embeddings
 *
 * Generates and stores embeddings for all active exercises missing them.
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 *
 * Usage:
 *   pnpm seed:embeddings
 *
 * Requires:
 *   - DATABASE_URL environment variable
 *   - OPENAI_API_KEY environment variable
 */

import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely';
import { Pool } from 'pg';
import OpenAI from 'openai';

const BATCH_SIZE = 20;

interface ExerciseRow {
  id: string;
  name: string;
  primaryMuscles: string[] | null;
  force: string | null;
  category: string;
}

function composeEmbeddingText(exercise: ExerciseRow): string {
  const parts = [exercise.name];
  if (exercise.primaryMuscles?.length) parts.push(exercise.primaryMuscles.join(', '));
  if (exercise.force) parts.push(exercise.force);
  if (exercise.category) parts.push(exercise.category);
  return parts.join(' | ');
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl, max: 5 });
  const db = new Kysely<Record<string, unknown>>({
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin()],
  });
  const openai = new OpenAI({ apiKey: openaiKey });

  let seeded = 0;
  let errors = 0;

  console.log('Fetching exercises missing embeddings...');

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await sql<ExerciseRow>`
      SELECT id, name, primary_muscles as "primaryMuscles", force, category
      FROM exercises
      WHERE embedding IS NULL AND is_active = true
      ORDER BY name ASC
      LIMIT ${BATCH_SIZE}
    `.execute(db);

    if (batch.rows.length === 0) break;

    for (const exercise of batch.rows) {
      try {
        const text = composeEmbeddingText(exercise);
        const response = await openai.embeddings.create({
          model: 'text-embedding-3-small',
          input: text,
        });
        const embedding = response.data[0].embedding;
        const vectorStr = `[${embedding.join(',')}]`;

        await sql`
          UPDATE exercises SET embedding = ${vectorStr}::vector WHERE id = ${exercise.id}
        `.execute(db);

        seeded++;
        if (seeded % 50 === 0) {
          console.log(`  ...seeded ${seeded} embeddings`);
        }
      } catch (error) {
        console.error(`Failed to seed "${exercise.name}":`, error);
        errors++;
      }
    }
  }

  console.log(`Done! Seeded: ${seeded}, Errors: ${errors}`);
  await db.destroy();
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
