import { Kysely, sql } from 'kysely';

/**
 * Owner Type and Organization Backfill Migration
 *
 * This migration:
 * 1. Converts 'brand' owner_type to 'admin' in program_owners
 * 2. Converts 'ai' owner_type to 'coach' in program_owners
 * 3. Adds organization_type column to organizations table
 * 4. Backfills organization_id on programs and blog_posts based on owner's org membership
 *
 * The backfill logic uses highest role priority (admin > editor > viewer),
 * then earliest joined_at to determine which organization to assign.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting owner type and organization backfill migration...');

  // 1. Convert 'brand' owners to 'admin'
  console.log('Converting brand owners to admin...');
  await sql`
    UPDATE program_owners
    SET owner_type = 'admin'
    WHERE owner_type = 'brand'
  `.execute(db);

  // 2. Convert 'ai' owners to 'coach'
  console.log('Converting ai owners to coach...');
  await sql`
    UPDATE program_owners
    SET owner_type = 'coach'
    WHERE owner_type = 'ai'
  `.execute(db);

  // 3. Add organization_type column to organizations
  console.log('Adding organization_type column to organizations...');
  await sql`
    ALTER TABLE organizations
    ADD COLUMN organization_type VARCHAR(20)
  `.execute(db);
  await sql`
    CREATE INDEX idx_organizations_type ON organizations(organization_type)
  `.execute(db);

  // 4. Backfill organization_id on programs (only where NULL)
  // Uses highest role priority: admin > editor > viewer, then earliest joined
  console.log('Backfilling organization_id on programs...');
  await sql`
    WITH owner_org_priority AS (
      SELECT DISTINCT ON (program_owner_id)
        program_owner_id,
        organization_id
      FROM organization_members
      ORDER BY program_owner_id,
        CASE role WHEN 'admin' THEN 1 WHEN 'editor' THEN 2 ELSE 3 END,
        joined_at ASC
    )
    UPDATE programs p
    SET organization_id = oop.organization_id
    FROM owner_org_priority oop
    WHERE p.owner_id = oop.program_owner_id
      AND p.organization_id IS NULL
  `.execute(db);

  // 5. Backfill organization_id on blog_posts (only where NULL)
  console.log('Backfilling organization_id on blog_posts...');
  await sql`
    WITH owner_org_priority AS (
      SELECT DISTINCT ON (program_owner_id)
        program_owner_id,
        organization_id
      FROM organization_members
      ORDER BY program_owner_id,
        CASE role WHEN 'admin' THEN 1 WHEN 'editor' THEN 2 ELSE 3 END,
        joined_at ASC
    )
    UPDATE blog_posts bp
    SET organization_id = oop.organization_id
    FROM owner_org_priority oop
    WHERE bp.owner_id = oop.program_owner_id
      AND bp.organization_id IS NULL
  `.execute(db);

  console.log('Owner type and organization backfill migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Down migration is a no-op - we cannot reliably restore original 'brand'/'ai' owners
  // or determine which organization_ids were previously NULL
  console.log('Down migration is a no-op - cannot reliably restore original owner types or NULL org IDs');
}
