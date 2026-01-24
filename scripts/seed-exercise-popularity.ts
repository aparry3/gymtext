/**
 * Seed Exercise Popularity
 *
 * Uses GPT-5-nano to assign a popularity score (0–1) to every active exercise.
 * Exercises are sent in batches and the model returns scores as JSON.
 * Results are written directly to the exercises.popularity column.
 *
 * Usage:
 *   source .env.local && npx tsx scripts/seed-exercise-popularity.ts
 *
 * Requires:
 *   - DATABASE_URL environment variable
 *   - OPENAI_API_KEY environment variable
 */

import { Kysely, PostgresDialect, CamelCasePlugin, sql } from 'kysely';
import { Pool } from 'pg';
import OpenAI from 'openai';

const BATCH_SIZE = 50;
const CONCURRENCY = 5;

interface ExerciseRow {
  id: string;
  name: string;
  category: string;
  equipment: string | null;
}

const SYSTEM_PROMPT = `You are a fitness expert. Rate each exercise's popularity/commonality on a scale from 0.0 to 1.0, where 1.0 means extremely popular and widely performed in gyms worldwide (e.g., bench press, squat), and 0.0 means extremely obscure. Consider how frequently the exercise appears in typical training programs. Respond with JSON only.`;

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

  const pool = new Pool({ connectionString: databaseUrl, max: CONCURRENCY + 1 });
  const db = new Kysely<Record<string, unknown>>({
    dialect: new PostgresDialect({ pool }),
    plugins: [new CamelCasePlugin()],
  });
  const openai = new OpenAI({ apiKey: openaiKey });

  console.log('Fetching all active exercises...');

  const allExercises = (
    await sql<ExerciseRow>`
      SELECT id, name, category, equipment
      FROM exercises
      WHERE is_active = true
      ORDER BY name ASC
    `.execute(db)
  ).rows;

  console.log(`Found ${allExercises.length} active exercises`);

  const totalBatches = Math.ceil(allExercises.length / BATCH_SIZE);
  let scored = 0;
  let errors = 0;

  const batches: ExerciseRow[][] = [];
  for (let i = 0; i < allExercises.length; i += BATCH_SIZE) {
    batches.push(allExercises.slice(i, i + BATCH_SIZE));
  }

  async function processBatch(batch: ExerciseRow[], batchNum: number) {
    const exerciseList = batch.map((e) => ({
      name: e.name,
      category: e.category,
      equipment: e.equipment ?? 'bodyweight',
    }));

    const userPrompt = `Rate these exercises:\n${JSON.stringify(exerciseList)}\n\nRespond as: { "scores": [0.85, 0.3, ...] }\nReturn scores in the same order as the input array.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 1,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        console.error(`Batch ${batchNum}/${totalBatches}: Empty response`);
        errors += batch.length;
        return;
      }

      const parsed = JSON.parse(content) as { scores: number[] };

      if (!Array.isArray(parsed.scores) || parsed.scores.length !== batch.length) {
        console.error(
          `Batch ${batchNum}/${totalBatches}: Score count mismatch (got ${parsed.scores?.length}, expected ${batch.length})`
        );
        errors += batch.length;
        return;
      }

      for (let j = 0; j < batch.length; j++) {
        const score = Math.max(0, Math.min(1, parsed.scores[j]));
        await sql`
          UPDATE exercises SET popularity = ${score} WHERE id = ${batch[j].id}
        `.execute(db);
        scored++;
      }

      console.log(`Batch ${batchNum}/${totalBatches} done, ${batch.length} exercises scored`);
    } catch (error) {
      console.error(`Batch ${batchNum}/${totalBatches} failed:`, error);
      errors += batch.length;
    }
  }

  // Process batches with concurrency limit
  for (let i = 0; i < batches.length; i += CONCURRENCY) {
    const chunk = batches.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map((batch, j) => processBatch(batch, i + j + 1)));
  }

  console.log(`Done! Scored: ${scored}, Errors: ${errors}`);
  await db.destroy();
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
