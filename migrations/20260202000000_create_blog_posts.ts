import { Kysely, sql } from 'kysely';

/**
 * Blog Posts Migration
 *
 * Creates the blog_posts table for the blog system.
 * Blog posts are owned by program owners and can be published publicly.
 */

export async function up(db: Kysely<unknown>): Promise<void> {
  console.log('Starting blog posts migration...');

  // Create blog_posts table
  console.log('Creating blog_posts table...');
  await sql`
    CREATE TABLE blog_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID NOT NULL REFERENCES program_owners(id) ON DELETE CASCADE,
      slug VARCHAR(200) NOT NULL UNIQUE,
      title VARCHAR(300) NOT NULL,
      description TEXT,
      content TEXT NOT NULL,
      cover_image_id UUID REFERENCES uploaded_images(id) ON DELETE SET NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
      published_at TIMESTAMPTZ,
      tags JSONB DEFAULT '[]'::jsonb,
      meta_title VARCHAR(70),
      meta_description VARCHAR(160),
      reading_time_minutes INTEGER,
      view_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `.execute(db);

  // Create indexes
  console.log('Creating indexes...');

  // Index on owner_id for listing posts by owner
  await sql`
    CREATE INDEX idx_blog_posts_owner_id ON blog_posts(owner_id)
  `.execute(db);

  // Index on status for filtering by status
  await sql`
    CREATE INDEX idx_blog_posts_status ON blog_posts(status)
  `.execute(db);

  // Index on published_at for ordering published posts
  await sql`
    CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST)
  `.execute(db);

  // Index on slug for fast lookups
  await sql`
    CREATE INDEX idx_blog_posts_slug ON blog_posts(slug)
  `.execute(db);

  // GIN index on tags for tag filtering
  await sql`
    CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN(tags)
  `.execute(db);

  console.log('Blog posts migration complete!');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  console.log('Rolling back blog posts migration...');

  // Drop indexes first
  console.log('Dropping indexes...');
  await sql`DROP INDEX IF EXISTS idx_blog_posts_tags`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_blog_posts_slug`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_blog_posts_published_at`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_blog_posts_status`.execute(db);
  await sql`DROP INDEX IF EXISTS idx_blog_posts_owner_id`.execute(db);

  // Drop table
  console.log('Dropping blog_posts table...');
  await sql`DROP TABLE IF EXISTS blog_posts`.execute(db);

  console.log('Blog posts rollback complete!');
}
