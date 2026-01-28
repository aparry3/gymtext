import { Kysely, sql } from 'kysely';

/**
 * Program Owners Portal Migration
 *
 * This migration adds the following changes for the program owners portal:
 *
 * 1. Add phone column to program_owners for authentication
 * 2. Add questions JSON column to program_versions for custom program questions
 * 3. Add cover_image_id to programs for program cover photos
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting program owners portal migration...');

  // 1. Add phone column to program_owners for authentication
  console.log('Adding phone column to program_owners...');
  await sql`
    ALTER TABLE program_owners
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
  `.execute(db);

  // Create unique partial index on phone (where phone is not null)
  console.log('Creating unique index on program_owners.phone...');
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_program_owners_phone
    ON program_owners (phone)
    WHERE phone IS NOT NULL
  `.execute(db);

  // 2. Add questions JSON column to program_versions
  console.log('Adding questions column to program_versions...');
  await sql`
    ALTER TABLE program_versions
    ADD COLUMN IF NOT EXISTS questions JSONB
  `.execute(db);

  // 3. Add cover_image_id to programs (references uploaded_images)
  console.log('Adding cover_image_id column to programs...');
  await sql`
    ALTER TABLE programs
    ADD COLUMN IF NOT EXISTS cover_image_id UUID REFERENCES uploaded_images(id) ON DELETE SET NULL
  `.execute(db);

  console.log('Program owners portal migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back program owners portal migration...');

  // 1. Remove cover_image_id from programs
  console.log('Removing cover_image_id from programs...');
  await sql`
    ALTER TABLE programs
    DROP COLUMN IF EXISTS cover_image_id
  `.execute(db);

  // 2. Remove questions from program_versions
  console.log('Removing questions from program_versions...');
  await sql`
    ALTER TABLE program_versions
    DROP COLUMN IF EXISTS questions
  `.execute(db);

  // 3. Remove phone index and column from program_owners
  console.log('Removing phone index from program_owners...');
  await sql`
    DROP INDEX IF EXISTS idx_program_owners_phone
  `.execute(db);

  console.log('Removing phone column from program_owners...');
  await sql`
    ALTER TABLE program_owners
    DROP COLUMN IF EXISTS phone
  `.execute(db);

  console.log('Program owners portal rollback complete!');
}
