import type { RepositoryContainer } from '../../../repositories/factory';
import type {
  BlogPost,
  NewBlogPost,
  BlogPostUpdate,
  BlogPostWithAuthor,
  BlogPostListItem,
} from '../../../models/blogPost';
import { BlogPostModel } from '../../../models/blogPost';
import type { ListPublishedOptions, TagCount } from '../../../repositories/blogPostRepository';

/**
 * Blog Service Instance Interface
 */
export interface BlogServiceInstance {
  // Public methods (for consumer web app)
  getPublishedBySlug(slug: string): Promise<BlogPostWithAuthor | null>;
  listPublished(options?: ListPublishedOptions): Promise<{ posts: BlogPostListItem[]; total: number }>;
  listPopular(limit?: number): Promise<BlogPostListItem[]>;
  listTags(): Promise<TagCount[]>;
  trackView(id: string): Promise<void>;

  // Management methods (for programs portal)
  create(ownerId: string, data: CreateBlogPostInput): Promise<BlogPost>;
  getById(id: string): Promise<BlogPost | null>;
  getByOwnerId(ownerId: string): Promise<BlogPost[]>;
  update(id: string, ownerId: string, data: UpdateBlogPostInput): Promise<BlogPost | null>;
  publish(id: string, ownerId: string): Promise<BlogPost | null>;
  unpublish(id: string, ownerId: string): Promise<BlogPost | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}

/**
 * Input for creating a blog post
 */
export interface CreateBlogPostInput {
  title: string;
  slug?: string; // Auto-generated if not provided
  description?: string;
  content: string;
  coverImageId?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}

/**
 * Input for updating a blog post
 */
export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  description?: string | null;
  content?: string;
  coverImageId?: string | null;
  tags?: string[];
  metaTitle?: string | null;
  metaDescription?: string | null;
}

/**
 * Create a BlogService instance
 */
export function createBlogService(repos: RepositoryContainer): BlogServiceInstance {
  /**
   * Verify the owner owns the post (for mutations)
   */
  async function verifyOwnership(id: string, ownerId: string): Promise<BlogPost | null> {
    const post = await repos.blogPost.findById(id);
    if (!post || post.ownerId !== ownerId) {
      return null;
    }
    return post;
  }

  /**
   * Generate a unique slug, appending numbers if needed
   */
  async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (!(await repos.blogPost.isSlugUnique(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  return {
    // =========================================================================
    // Public methods (for consumer web app)
    // =========================================================================

    async getPublishedBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
      return repos.blogPost.findPublishedBySlug(slug);
    },

    async listPublished(options: ListPublishedOptions = {}): Promise<{ posts: BlogPostListItem[]; total: number }> {
      return repos.blogPost.listPublished(options);
    },

    async listPopular(limit: number = 5): Promise<BlogPostListItem[]> {
      return repos.blogPost.listPopular(limit);
    },

    async listTags(): Promise<TagCount[]> {
      return repos.blogPost.listTags();
    },

    async trackView(id: string): Promise<void> {
      await repos.blogPost.incrementViewCount(id);
    },

    // =========================================================================
    // Management methods (for programs portal)
    // =========================================================================

    async create(ownerId: string, data: CreateBlogPostInput): Promise<BlogPost> {
      // Generate slug if not provided
      const baseSlug = data.slug || BlogPostModel.generateSlug(data.title);
      const slug = await generateUniqueSlug(baseSlug);

      // Calculate reading time
      const readingTimeMinutes = BlogPostModel.calculateReadingTime(data.content);

      const newPost: NewBlogPost = {
        ownerId,
        slug,
        title: data.title,
        description: data.description || null,
        content: data.content,
        coverImageId: data.coverImageId || null,
        status: 'draft',
        tags: JSON.stringify(data.tags || []),
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        readingTimeMinutes,
      };

      return repos.blogPost.create(newPost);
    },

    async getById(id: string): Promise<BlogPost | null> {
      return repos.blogPost.findById(id);
    },

    async getByOwnerId(ownerId: string): Promise<BlogPost[]> {
      return repos.blogPost.findByOwnerId(ownerId);
    },

    async update(id: string, ownerId: string, data: UpdateBlogPostInput): Promise<BlogPost | null> {
      // Verify ownership
      const post = await verifyOwnership(id, ownerId);
      if (!post) return null;

      // Prepare update data
      const updateData: BlogPostUpdate = {};

      if (data.title !== undefined) {
        updateData.title = data.title;
      }

      if (data.slug !== undefined) {
        // Validate and ensure uniqueness
        const baseSlug = BlogPostModel.generateSlug(data.slug);
        updateData.slug = await generateUniqueSlug(baseSlug, id);
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      if (data.content !== undefined) {
        updateData.content = data.content;
        // Recalculate reading time
        updateData.readingTimeMinutes = BlogPostModel.calculateReadingTime(data.content);
      }

      if (data.coverImageId !== undefined) {
        updateData.coverImageId = data.coverImageId;
      }

      if (data.tags !== undefined) {
        updateData.tags = JSON.stringify(data.tags);
      }

      if (data.metaTitle !== undefined) {
        updateData.metaTitle = data.metaTitle;
      }

      if (data.metaDescription !== undefined) {
        updateData.metaDescription = data.metaDescription;
      }

      return repos.blogPost.update(id, updateData);
    },

    async publish(id: string, ownerId: string): Promise<BlogPost | null> {
      // Verify ownership
      const post = await verifyOwnership(id, ownerId);
      if (!post) return null;

      // Can only publish drafts
      if (post.status !== 'draft') {
        return post; // Already published or archived
      }

      return repos.blogPost.update(id, {
        status: 'published',
        publishedAt: new Date(),
      });
    },

    async unpublish(id: string, ownerId: string): Promise<BlogPost | null> {
      // Verify ownership
      const post = await verifyOwnership(id, ownerId);
      if (!post) return null;

      // Can only unpublish published posts
      if (post.status !== 'published') {
        return post; // Already draft or archived
      }

      return repos.blogPost.update(id, {
        status: 'draft',
        publishedAt: null,
      });
    },

    async delete(id: string, ownerId: string): Promise<boolean> {
      // Verify ownership
      const post = await verifyOwnership(id, ownerId);
      if (!post) return false;

      return repos.blogPost.delete(id);
    },
  };
}
