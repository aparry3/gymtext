import { Kysely, sql } from 'kysely';

/**
 * Drop press_plane and kinetic_chain columns, make classification fields nullable.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  // Drop unused columns
  await sql`ALTER TABLE exercises DROP COLUMN press_plane`.execute(db);
  await sql`ALTER TABLE exercises DROP COLUMN kinetic_chain`.execute(db);

  // Make classification fields nullable
  await sql`ALTER TABLE exercises ALTER COLUMN mechanics DROP NOT NULL`.execute(db);
  await sql`ALTER TABLE exercises ALTER COLUMN modality DROP NOT NULL`.execute(db);
  await sql`ALTER TABLE exercises ALTER COLUMN intensity DROP NOT NULL`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Re-add columns
  await sql`ALTER TABLE exercises ADD COLUMN kinetic_chain TEXT NOT NULL DEFAULT ''`.execute(db);
  await sql`ALTER TABLE exercises ADD COLUMN press_plane TEXT NOT NULL DEFAULT ''`.execute(db);

  // Restore NOT NULL (set empty string for any nulls first)
  await sql`UPDATE exercises SET mechanics = '' WHERE mechanics IS NULL`.execute(db);
  await sql`ALTER TABLE exercises ALTER COLUMN mechanics SET NOT NULL`.execute(db);

  await sql`UPDATE exercises SET modality = '' WHERE modality IS NULL`.execute(db);
  await sql`ALTER TABLE exercises ALTER COLUMN modality SET NOT NULL`.execute(db);

  await sql`UPDATE exercises SET intensity = '' WHERE intensity IS NULL`.execute(db);
  await sql`ALTER TABLE exercises ALTER COLUMN intensity SET NOT NULL`.execute(db);
}
