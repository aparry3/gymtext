/**
 * Seed Exercise Embeddings
 *
 * Generates embedding text and vector embeddings for all exercises.
 * Run: pnpm seed:embeddings
 *
 * Features:
 * - Generates structured embedding text using exerciseToEmbeddingText
 * - Creates vector embeddings via OpenAI text-embedding-3-small
 * - Batch updates with rate limiting
 * - Progress logging
 * - Skips exercises with current embedding_text_version
 */

import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import OpenAI from 'openai';

// ============================================================================
// Embedding Text Generation (duplicated from shared package to avoid server-only import)
// Keep in sync with: packages/shared/src/server/utils/embeddings.ts
// ============================================================================

const EMBEDDING_TEXT_VERSION = 1;

interface ExerciseForEmbedding {
  name: string;
  type: string;
  modality?: string | null;
  movementPatterns?: string[] | null;
  equipment?: string[] | null;
  primaryMuscles?: string[] | null;
  secondaryMuscles?: string[] | null;
  trainingGroups?: string[] | null;
  aliases?: string[] | null;
  shortDescription?: string | null;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      const acronyms = ['db', 'bb', 'kb', 'trx', 'ez', 'ghr', 'rdl', 'hiit', 'amrap', 'emom'];
      if (acronyms.includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

function normalizeList(arr: string[] | null | undefined): string[] {
  if (!arr || arr.length === 0) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    result.push(toTitleCase(trimmed));
  }
  return result.sort((a, b) => a.localeCompare(b));
}

function normalizeAliases(arr: string[] | null | undefined): string[] {
  if (!arr || arr.length === 0) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of arr) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    result.push(trimmed.toLowerCase());
  }
  return result.sort((a, b) => a.localeCompare(b)).slice(0, 25);
}

function exerciseToEmbeddingText(exercise: ExerciseForEmbedding): string {
  const lines: string[] = [];

  lines.push(`EXERCISE: ${toTitleCase(exercise.name)}`);

  const typeLine: string[] = [];
  typeLine.push(`TYPE: ${toTitleCase(exercise.type)}`);

  if (exercise.modality?.trim()) {
    typeLine.push(`MODALITY: ${toTitleCase(exercise.modality)}`);
  }

  const patterns = normalizeList(exercise.movementPatterns);
  if (patterns.length > 0) {
    typeLine.push(`PATTERNS: ${patterns.join(', ')}`);
  }

  const equipment = normalizeList(exercise.equipment);
  if (equipment.length > 0) {
    typeLine.push(`EQUIPMENT: ${equipment.join(', ')}`);
  }

  lines.push(typeLine.join(' | '));

  const primary = normalizeList(exercise.primaryMuscles);
  const secondary = normalizeList(exercise.secondaryMuscles);

  if (primary.length > 0 || secondary.length > 0) {
    const muscleParts: string[] = [];
    if (primary.length > 0) {
      muscleParts.push(`primary=${primary.join(', ')}`);
    }
    if (secondary.length > 0) {
      muscleParts.push(`secondary=${secondary.join(', ')}`);
    }
    lines.push(`MUSCLES: ${muscleParts.join(' | ')}`);
  }

  const tags = normalizeList(exercise.trainingGroups);
  if (tags.length > 0) {
    lines.push(`TAGS: ${tags.join(', ')}`);
  }

  const aliases = normalizeAliases(exercise.aliases);
  if (aliases.length > 0) {
    lines.push(`ALIASES: ${aliases.join(', ')}`);
  }

  if (exercise.shortDescription?.trim()) {
    let desc = exercise.shortDescription.trim();
    if (desc.length > 200) {
      const sentenceEnd = desc.lastIndexOf('.', 200);
      if (sentenceEnd > 50) {
        desc = desc.substring(0, sentenceEnd + 1);
      } else {
        desc = desc.substring(0, 200).trim() + '...';
      }
    }
    lines.push(`DESCRIPTION: ${desc}`);
  }

  return lines.join('\n');
}

// ============================================================================
// Script Implementation
// ============================================================================

// Database row type
interface ExerciseRow {
  id: string;
  name: string;
  type: string;
  modality: string | null;
  movementPatterns: string[];
  equipment: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  trainingGroups: string[];
  aliases: string[];
  shortDescription: string;
  embeddingText: string | null;
  embeddingTextVersion: number | null;
}

// Connect to database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set. Run: source .env.local');
}

const openaiApiKey = process.env.OPENAI_API_KEY;
if (!openaiApiKey) {
  throw new Error('OPENAI_API_KEY environment variable is not set. Run: source .env.local');
}

const pool = new Pool({ connectionString: databaseUrl, max: 10 });
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

const openai = new OpenAI({ apiKey: openaiApiKey });

// Configuration
const BATCH_SIZE = 50;
const RATE_LIMIT_DELAY_MS = 100; // Delay between OpenAI calls to avoid rate limits
const FORCE_REGENERATE = process.argv.includes('--force');

/**
 * Generate embedding vector using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Format embedding vector for PostgreSQL
 */
function formatVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('='.repeat(60));
  console.log('Seed Exercise Embeddings');
  console.log('='.repeat(60));
  console.log(`Embedding text version: ${EMBEDDING_TEXT_VERSION}`);
  console.log(`Force regenerate: ${FORCE_REGENERATE}`);
  console.log('');

  // Load exercises
  console.log('Loading exercises from database...');
  const exercises = await sql<ExerciseRow>`
    SELECT
      id, name, type, modality,
      movement_patterns as "movementPatterns",
      equipment,
      primary_muscles as "primaryMuscles",
      secondary_muscles as "secondaryMuscles",
      training_groups as "trainingGroups",
      aliases,
      short_description as "shortDescription",
      embedding_text as "embeddingText",
      embedding_text_version as "embeddingTextVersion"
    FROM exercises
    WHERE is_active = true
    ORDER BY name
  `.execute(db);

  console.log(`Found ${exercises.rows.length} active exercises`);

  // Filter exercises that need updating:
  // - Force regenerate all, OR
  // - No embedding_text yet (null/empty), OR
  // - Version is outdated
  const exercisesToUpdate = FORCE_REGENERATE
    ? exercises.rows
    : exercises.rows.filter(e =>
        !e.embeddingText || e.embeddingTextVersion !== EMBEDDING_TEXT_VERSION
      );

  console.log(`Exercises to update: ${exercisesToUpdate.length}`);
  if (exercisesToUpdate.length === 0) {
    console.log('All exercises are up to date. Use --force to regenerate all.');
    await db.destroy();
    return;
  }

  console.log('');
  console.log('Generating embeddings...');

  let successCount = 0;
  let errorCount = 0;
  const errors: { name: string; error: string }[] = [];

  for (let i = 0; i < exercisesToUpdate.length; i += BATCH_SIZE) {
    const batch = exercisesToUpdate.slice(i, i + BATCH_SIZE);
    const batchStart = i + 1;
    const batchEnd = Math.min(i + BATCH_SIZE, exercisesToUpdate.length);

    console.log(`\nProcessing batch ${batchStart}-${batchEnd}...`);

    for (const exercise of batch) {
      try {
        // Convert to embedding input format
        const exerciseForEmbedding: ExerciseForEmbedding = {
          name: exercise.name,
          type: exercise.type,
          modality: exercise.modality,
          movementPatterns: exercise.movementPatterns,
          equipment: exercise.equipment,
          primaryMuscles: exercise.primaryMuscles,
          secondaryMuscles: exercise.secondaryMuscles,
          trainingGroups: exercise.trainingGroups,
          aliases: exercise.aliases,
          shortDescription: exercise.shortDescription,
        };

        // Generate embedding text
        const embeddingText = exerciseToEmbeddingText(exerciseForEmbedding);

        // Generate vector embedding
        const embedding = await generateEmbedding(embeddingText);

        // Update database
        await sql`
          UPDATE exercises
          SET
            embedding_text = ${embeddingText},
            embedding = ${formatVector(embedding)}::vector,
            embedding_text_version = ${EMBEDDING_TEXT_VERSION},
            updated_at = now()
          WHERE id = ${exercise.id}
        `.execute(db);

        successCount++;

        // Rate limiting
        await sleep(RATE_LIMIT_DELAY_MS);
      } catch (err) {
        errorCount++;
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push({ name: exercise.name, error: errorMessage });
        console.error(`  Error: ${exercise.name} - ${errorMessage}`);
      }
    }

    // Progress indicator
    const progress = Math.round(((i + batch.length) / exercisesToUpdate.length) * 100);
    console.log(`  Progress: ${progress}% (${successCount} success, ${errorCount} errors)`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  console.log(`Total exercises: ${exercises.rows.length}`);
  console.log(`Updated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Skipped (already current): ${exercises.rows.length - exercisesToUpdate.length}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    for (const { name, error } of errors.slice(0, 10)) {
      console.log(`  - ${name}: ${error}`);
    }
    if (errors.length > 10) {
      console.log(`  ... and ${errors.length - 10} more`);
    }
  }

  // Verify sample
  console.log('\n' + '='.repeat(60));
  console.log('Sample Embedding Texts (first 3)');
  console.log('='.repeat(60));

  const samples = await sql<{ name: string; embeddingText: string }>`
    SELECT name, embedding_text as "embeddingText"
    FROM exercises
    WHERE embedding_text IS NOT NULL
    ORDER BY name
    LIMIT 3
  `.execute(db);

  for (const sample of samples.rows) {
    console.log(`\n--- ${sample.name} ---`);
    console.log(sample.embeddingText);
  }

  console.log('\nDone!');
  await db.destroy();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
