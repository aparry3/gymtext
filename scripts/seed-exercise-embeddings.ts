/**
 * Seed Exercise Embeddings
 *
 * Generates and stores embeddings for all active exercises missing them.
 * Uses OpenAI text-embedding-3-small (1536 dimensions).
 *
 * Usage:
 *   npx tsx scripts/seed-exercise-embeddings.ts
 *
 * Requires:
 *   - DATABASE_URL environment variable
 *   - OPENAI_API_KEY environment variable
 */

import { createDatabase } from '../packages/shared/src/server/connections/postgres/factory';
import { createRepositories } from '../packages/shared/src/server/repositories/factory';
import { createExerciseResolutionService } from '../packages/shared/src/server/services/domain/exercise/exerciseResolutionService';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const db = createDatabase(databaseUrl);
  const repos = createRepositories(db);
  const resolutionService = createExerciseResolutionService(repos);

  console.log('Seeding exercise embeddings...');
  const { seeded, errors } = await resolutionService.seedAllEmbeddings();

  console.log(`Done! Seeded: ${seeded}, Errors: ${errors}`);

  await db.destroy();
  process.exit(errors > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
