import { BaseRepository } from '@/server/repositories/baseRepository';
import {
  BlogPostModel,
  type BlogPost,
  type NewBlogPost,
  type BlogPostUpdate,
  type BlogPostWithAuthor,
  type BlogPostListItem,
  type BlogPostStatus,
} from '@/server/models/blogPost';
import { sql } from 'kysely';

export interface ListPublishedOptions {
  limit?: number;
  offset?: number;
  tag?: string;
  search?: string;
}

export interface TagCount {
  tag: string;
  count: number;
}

/**
 * Repository for blog post database operations
 */
export class BlogPostRepository extends BaseRepository {
  /**
   * Create a new blog post
   */
  async create(data: NewBlogPost): Promise<BlogPost> {
    const result = await this.db
      .insertInto('blogPosts')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();

    return BlogPostModel.fromDB(result);
  }

  /**
   * Find a blog post by ID with cover image URL
   */
  async findById(id: string): Promise<(BlogPost & { coverImageUrl: string | null }) | null> {
    const result = await this.db
      .selectFrom('blogPosts')
      .leftJoin('uploadedImages', 'uploadedImages.id', 'blogPosts.coverImageId')
      .select([
        'blogPosts.id',
        'blogPosts.ownerId',
        'blogPosts.organizationId',
        'blogPosts.slug',
        'blogPosts.title',
        'blogPosts.description',
        'blogPosts.content',
        'blogPosts.coverImageId',
        'blogPosts.status',
        'blogPosts.publishedAt',
        'blogPosts.tags',
        'blogPosts.metaTitle',
        'blogPosts.metaDescription',
        'blogPosts.readingTimeMinutes',
        'blogPosts.viewCount',
        'blogPosts.createdAt',
        'blogPosts.updatedAt',
        'uploadedImages.url as coverImageUrl',
      ])
      .where('blogPosts.id', '=', id)
      .executeTakeFirst();

    if (!result) return null;

    return {
      ...BlogPostModel.fromDB(result),
      coverImageUrl: result.coverImageUrl ?? null,
    };
  }

  /**
   * Find a published blog post by slug with author info
   */
  async findPublishedBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
    const result = await this.db
      .selectFrom('blogPosts')
      .innerJoin('programOwners', 'programOwners.id', 'blogPosts.ownerId')
      .select([
        'blogPosts.id',
        'blogPosts.ownerId',
        'blogPosts.organizationId',
        'blogPosts.slug',
        'blogPosts.title',
        'blogPosts.description',
        'blogPosts.content',
        'blogPosts.coverImageId',
        'blogPosts.status',
        'blogPosts.publishedAt',
        'blogPosts.tags',
        'blogPosts.metaTitle',
        'blogPosts.metaDescription',
        'blogPosts.readingTimeMinutes',
        'blogPosts.viewCount',
        'blogPosts.createdAt',
        'blogPosts.updatedAt',
        'programOwners.id as authorId',
        'programOwners.displayName as authorDisplayName',
        'programOwners.avatarUrl as authorAvatarUrl',
        'programOwners.bio as authorBio',
      ])
      .where('blogPosts.slug', '=', slug)
      .where('blogPosts.status', '=', 'published')
      .executeTakeFirst();

    if (!result) return null;

    const post = BlogPostModel.fromDB(result);
    return {
      ...post,
      author: {
        id: result.authorId,
        displayName: result.authorDisplayName,
        avatarUrl: result.authorAvatarUrl,
        bio: result.authorBio,
      },
    };
  }

  /**
   * List published blog posts with pagination and filtering
   */
  async listPublished(options: ListPublishedOptions = {}): Promise<{ posts: BlogPostListItem[]; total: number }> {
    const { limit = 10, offset = 0, tag, search } = options;

    let query = this.db
      .selectFrom('blogPosts')
      .innerJoin('programOwners', 'programOwners.id', 'blogPosts.ownerId')
      .leftJoin('uploadedImages', 'uploadedImages.id', 'blogPosts.coverImageId')
      .where('blogPosts.status', '=', 'published');

    // Filter by tag using raw SQL expression
    if (tag) {
      query = query.where(
        sql<boolean>`${sql.ref('blogPosts.tags')} @> ${JSON.stringify([tag])}::jsonb`
      );
    }

    // Search in title and description
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.where((eb) =>
        eb.or([
          eb('blogPosts.title', 'ilike', searchPattern),
          eb('blogPosts.description', 'ilike', searchPattern),
        ])
      );
    }

    // Get total count
    const countResult = await query
      .select(sql<number>`count(*)::int`.as('count'))
      .executeTakeFirst();
    const total = countResult?.count ?? 0;

    // Get posts
    const posts = await query
      .select([
        'blogPosts.id',
        'blogPosts.slug',
        'blogPosts.title',
        'blogPosts.description',
        'blogPosts.status',
        'blogPosts.publishedAt',
        'blogPosts.tags',
        'blogPosts.readingTimeMinutes',
        'blogPosts.viewCount',
        'uploadedImages.url as coverImageUrl',
        'programOwners.id as authorId',
        'programOwners.displayName as authorDisplayName',
        'programOwners.avatarUrl as authorAvatarUrl',
      ])
      .orderBy('blogPosts.publishedAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute();

    return {
      posts: posts.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        coverImageUrl: row.coverImageUrl,
        status: row.status as BlogPostStatus,
        publishedAt: row.publishedAt ? new Date(row.publishedAt as unknown as string | number | Date) : null,
        tags: (row.tags as string[]) || [],
        readingTimeMinutes: row.readingTimeMinutes,
        viewCount: row.viewCount,
        author: {
          id: row.authorId,
          displayName: row.authorDisplayName,
          avatarUrl: row.authorAvatarUrl,
        },
      })),
      total,
    };
  }

  /**
   * List blog posts by owner ID (for management portal)
   */
  async findByOwnerId(ownerId: string): Promise<BlogPost[]> {
    const results = await this.db
      .selectFrom('blogPosts')
      .selectAll()
      .where('ownerId', '=', ownerId)
      .orderBy('createdAt', 'desc')
      .execute();

    return results.map(BlogPostModel.fromDB);
  }

  /**
   * List popular published posts by view count
   */
  async listPopular(limit: number = 5): Promise<BlogPostListItem[]> {
    const posts = await this.db
      .selectFrom('blogPosts')
      .innerJoin('programOwners', 'programOwners.id', 'blogPosts.ownerId')
      .leftJoin('uploadedImages', 'uploadedImages.id', 'blogPosts.coverImageId')
      .select([
        'blogPosts.id',
        'blogPosts.slug',
        'blogPosts.title',
        'blogPosts.description',
        'blogPosts.status',
        'blogPosts.publishedAt',
        'blogPosts.tags',
        'blogPosts.readingTimeMinutes',
        'blogPosts.viewCount',
        'uploadedImages.url as coverImageUrl',
        'programOwners.id as authorId',
        'programOwners.displayName as authorDisplayName',
        'programOwners.avatarUrl as authorAvatarUrl',
      ])
      .where('blogPosts.status', '=', 'published')
      .orderBy('blogPosts.viewCount', 'desc')
      .limit(limit)
      .execute();

    return posts.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      coverImageUrl: row.coverImageUrl,
      status: row.status as BlogPostStatus,
      publishedAt: row.publishedAt ? new Date(row.publishedAt as unknown as string | number | Date) : null,
      tags: (row.tags as string[]) || [],
      readingTimeMinutes: row.readingTimeMinutes,
      viewCount: row.viewCount,
      author: {
        id: row.authorId,
        displayName: row.authorDisplayName,
        avatarUrl: row.authorAvatarUrl,
      },
    }));
  }

  /**
   * Increment view count for a post
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.db
      .updateTable('blogPosts')
      .set({
        viewCount: sql`view_count + 1`,
      })
      .where('id', '=', id)
      .execute();
  }

  /**
   * List unique tags with their post counts
   */
  async listTags(): Promise<TagCount[]> {
    const results = await this.db
      .selectFrom('blogPosts')
      .select(sql<string>`jsonb_array_elements_text(tags)`.as('tag'))
      .where('status', '=', 'published')
      .execute();

    // Count tags manually (Kysely doesn't support grouping by jsonb_array_elements directly well)
    const tagCounts = new Map<string, number>();
    for (const row of results) {
      const count = tagCounts.get(row.tag) || 0;
      tagCounts.set(row.tag, count + 1);
    }

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Update a blog post
   */
  async update(id: string, data: BlogPostUpdate): Promise<BlogPost | null> {
    const result = await this.db
      .updateTable('blogPosts')
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst();

    return result ? BlogPostModel.fromDB(result) : null;
  }

  /**
   * Delete a blog post
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('blogPosts')
      .where('id', '=', id)
      .executeTakeFirst();

    return (result.numDeletedRows ?? 0) > 0;
  }

  /**
   * Check if a slug is unique (optionally excluding a specific post ID)
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    let query = this.db
      .selectFrom('blogPosts')
      .select('id')
      .where('slug', '=', slug);

    if (excludeId) {
      query = query.where('id', '!=', excludeId);
    }

    const result = await query.executeTakeFirst();
    return !result;
  }
}
