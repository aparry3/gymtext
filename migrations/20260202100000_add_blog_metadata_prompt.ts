import { Kysely, sql } from 'kysely';

/**
 * Add blog metadata generation prompt
 *
 * This prompt is used by the blog metadata agent service to:
 * - blog:metadata: Generate metadata (title, description, tags, SEO fields) from blog content
 */

const BLOG_METADATA_SYSTEM = `You are a content marketing expert helping bloggers optimize their posts for engagement and SEO.

Given the raw text content of a blog post, generate metadata that will help it perform well.

REQUIREMENTS:

**title** (engaging blog post title):
- Create a compelling, click-worthy title
- Make it specific and benefit-focused
- Keep it under 70 characters
- Avoid clickbait - the title should accurately reflect the content

**description** (brief description for listings):
- Write 1-2 sentences summarizing the post
- Focus on the main takeaway or value proposition
- Ideal for blog listing pages and social media previews

**tags** (relevant topic tags):
- Provide 3-5 lowercase, hyphenated tags
- Examples: "strength-training", "nutrition-tips", "workout-planning"
- Tags should be broad enough to be useful for categorization
- Avoid overly specific or one-off tags

**metaTitle** (SEO title):
- Optimized for search engines
- Include relevant keywords naturally
- Maximum 70 characters
- Can differ from the main title for SEO purposes

**metaDescription** (SEO description):
- Maximum 160 characters
- Include a clear call-to-action or value proposition
- Make it compelling for search result click-through
- Include relevant keywords naturally

OUTPUT FORMAT:
Return valid JSON matching the required schema with all five fields.`;

const BLOG_METADATA_USER = `Generate metadata for this blog post content:

<Content>
{{content}}
</Content>

Analyze the content and generate:
- An engaging title
- A brief description
- 3-5 relevant tags
- SEO-optimized metaTitle (max 70 chars)
- SEO-optimized metaDescription (max 160 chars)`;

export async function up(db: Kysely<unknown>): Promise<void> {
  // Insert blog:metadata prompts
  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES (${'blog:metadata'}, ${'system'}, ${BLOG_METADATA_SYSTEM})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  await sql`
    INSERT INTO prompts (id, role, value)
    VALUES (${'blog:metadata'}, ${'user'}, ${BLOG_METADATA_USER})
    ON CONFLICT (id, role, created_at) DO NOTHING
  `.execute(db);

  console.log('Added blog:metadata prompts');
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await sql`
    DELETE FROM prompts WHERE id = ${'blog:metadata'}
  `.execute(db);

  console.log('Removed blog:metadata prompts');
}
