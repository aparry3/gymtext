import { Kysely, sql } from 'kysely';

/**
 * Organizations Migration
 *
 * Adds organizations support to GymText:
 * - Creates organizations table for managing company/brand entities
 * - Creates organization_members junction table for many-to-many relationship with program_owners
 * - Adds organization_id to programs and blog_posts for attribution
 *
 * Key design decisions:
 * - Dual ownership model: creator (owner_id) + attribution (organization_id)
 * - When organization_id is set, content displays as "By [Organization]"
 * - When null, displays as "By [Owner]" (current behavior preserved)
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting organizations migration...');

  // Create organizations table
  console.log('Creating organizations table...');
  await sql`
    CREATE TABLE organizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(200) NOT NULL,
      slug VARCHAR(200) NOT NULL UNIQUE,
      description TEXT,
      logo_url TEXT,
      wordmark_url TEXT,
      website_url TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create indexes for organizations
  console.log('Creating organizations indexes...');
  await sql`CREATE INDEX idx_organizations_slug ON organizations(slug)`.execute(db);
  await sql`CREATE INDEX idx_organizations_is_active ON organizations(is_active)`.execute(db);

  // Create organization_members junction table
  console.log('Creating organization_members table...');
  await sql`
    CREATE TABLE organization_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      program_owner_id UUID NOT NULL REFERENCES program_owners(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
      joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (organization_id, program_owner_id)
    )
  `.execute(db);

  // Create indexes for organization_members
  console.log('Creating organization_members indexes...');
  await sql`CREATE INDEX idx_organization_members_organization_id ON organization_members(organization_id)`.execute(db);
  await sql`CREATE INDEX idx_organization_members_program_owner_id ON organization_members(program_owner_id)`.execute(db);

  // Add organization_id to programs table
  console.log('Adding organization_id to programs...');
  await sql`
    ALTER TABLE programs ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
  `.execute(db);
  await sql`CREATE INDEX idx_programs_organization_id ON programs(organization_id)`.execute(db);

  // Add organization_id to blog_posts table
  console.log('Adding organization_id to blog_posts...');
  await sql`
    ALTER TABLE blog_posts ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
  `.execute(db);
  await sql`CREATE INDEX idx_blog_posts_organization_id ON blog_posts(organization_id)`.execute(db);

  // Seed GymText organization
  console.log('Seeding GymText organization...');
  await sql`
    INSERT INTO organizations (name, slug, description, is_active)
    VALUES (
      'GymText',
      'gymtext',
      'AI-powered fitness coaching delivered via SMS',
      true
    )
  `.execute(db);

  console.log('Organizations migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back organizations migration...');

  // Drop indexes and columns from blog_posts
  console.log('Removing organization_id from blog_posts...');
  await sql`DROP INDEX IF EXISTS idx_blog_posts_organization_id`.execute(db);
  await sql`ALTER TABLE blog_posts DROP COLUMN IF EXISTS organization_id`.execute(db);

  // Drop indexes and columns from programs
  console.log('Removing organization_id from programs...');
  await sql`DROP INDEX IF EXISTS idx_programs_organization_id`.execute(db);
  await sql`ALTER TABLE programs DROP COLUMN IF EXISTS organization_id`.execute(db);

  // Drop organization_members table
  console.log('Dropping organization_members table...');
  await sql`DROP INDEX IF EXISTS idx_organization_members_program_owner_id`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_organization_members_organization_id`.execute(db);
  await sql`DROP TABLE IF EXISTS organization_members`.execute(db);

  // Drop organizations table
  console.log('Dropping organizations table...');
  await sql`DROP INDEX IF EXISTS idx_organizations_is_active`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_organizations_slug`.execute(db);
  await sql`DROP TABLE IF EXISTS organizations`.execute(db);

  console.log('Organizations rollback complete!');
}
