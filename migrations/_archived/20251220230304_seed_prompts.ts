import { Kysely, sql } from 'kysely';

/**
 * This migration has already been applied.
 * The original imports used path aliases that don't resolve in the migration runner.
 * Since the data is already seeded, we keep this as a no-op to allow migration runner to proceed.
 */

export async function up(_db: Kysely<unknown>): Promise<void> {
  console.log('seed_prompts: Migration already applied (no-op)');
}

export async function down(_db: Kysely<unknown>): Promise<void> {
  console.log('seed_prompts: Migration already applied - down is a no-op');
}
