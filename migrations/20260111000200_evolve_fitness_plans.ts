import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  console.log('Evolving fitness_plans table for program support...');

  // Add new columns
  await sql`ALTER TABLE fitness_plans ADD COLUMN program_id UUID REFERENCES programs(id) ON DELETE CASCADE`.execute(db);
  await sql`ALTER TABLE fitness_plans ADD COLUMN published_at TIMESTAMPTZ`.execute(db);

  // Rename client_id to legacy_client_id
  await db.schema
    .alterTable('fitness_plans')
    .renameColumn('client_id', 'legacy_client_id')
    .execute();

  // Create indexes for new query patterns
  await db.schema
    .createIndex('idx_fitness_plans_program_id')
    .on('fitness_plans')
    .column('program_id')
    .execute();

  await db.schema
    .createIndex('idx_fitness_plans_published_at')
    .on('fitness_plans')
    .column('published_at')
    .execute();

  console.log('Successfully evolved fitness_plans table');
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropIndex('idx_fitness_plans_published_at').execute();
  await db.schema.dropIndex('idx_fitness_plans_program_id').execute();

  await db.schema
    .alterTable('fitness_plans')
    .renameColumn('legacy_client_id', 'client_id')
    .execute();

  await sql`ALTER TABLE fitness_plans DROP COLUMN published_at`.execute(db);
  await sql`ALTER TABLE fitness_plans DROP COLUMN program_id`.execute(db);
}
