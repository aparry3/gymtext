import type { Insertable, Selectable, Updateable } from 'kysely';
import type { BlogPosts } from './_types';

// Database types from Kysely codegen
export type BlogPostDB = Selectable<BlogPosts>;
export type NewBlogPost = Insertable<BlogPosts>;
export type BlogPostUpdate = Updateable<BlogPosts>;

// Status types
export type BlogPostStatus = 'draft' | 'published' | 'archived';

/**
 * Blog post entity
 */
export interface BlogPost {
  id: string;
  ownerId: string;
  /** Optional organization for public attribution (displays as "By [Organization]" when set) */
  organizationId: string | null;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  coverImageId: string | null;
  status: BlogPostStatus;
  publishedAt: Date | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  readingTimeMinutes: number | null;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blog post with author information (from program_owners)
 */
export interface BlogPostWithAuthor extends BlogPost {
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    bio: string | null;
  };
}

/**
 * Blog post list item with cover image URL (for listings)
 */
export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  publishedAt: Date | null;
  tags: string[];
  readingTimeMinutes: number | null;
  viewCount: number;
  author: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

/**
 * Blog post model utilities
 */
export class BlogPostModel {
  /**
   * Convert database row to BlogPost entity
   */
  static fromDB(row: BlogPostDB): BlogPost {
    return {
      id: row.id,
      ownerId: row.ownerId,
      organizationId: row.organizationId ?? null,
      slug: row.slug,
      title: row.title,
      description: row.description,
      content: row.content,
      coverImageId: row.coverImageId,
      status: row.status as BlogPostStatus,
      publishedAt: row.publishedAt ? new Date(row.publishedAt as unknown as string | number | Date) : null,
      tags: (row.tags as string[]) || [],
      metaTitle: row.metaTitle,
      metaDescription: row.metaDescription,
      readingTimeMinutes: row.readingTimeMinutes,
      viewCount: row.viewCount,
      createdAt: new Date(row.createdAt as unknown as string | number | Date),
      updatedAt: new Date(row.updatedAt as unknown as string | number | Date),
    };
  }

  /**
   * Calculate reading time in minutes based on content
   * Assumes average reading speed of 200 words per minute
   */
  static calculateReadingTime(content: string): number {
    // Strip HTML tags for word counting
    const text = content.replace(/<[^>]*>/g, ' ');
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const wordsPerMinute = 200;
    const minutes = Math.ceil(words.length / wordsPerMinute);
    return Math.max(1, minutes); // Minimum 1 minute
  }

  /**
   * Generate a URL-friendly slug from a title
   */
  static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Replace multiple hyphens with single
      .replace(/^-|-$/g, '')     // Remove leading/trailing hyphens
      .slice(0, 200);            // Limit length
  }

  /**
   * Validate slug format
   */
  static isValidSlug(slug: string): boolean {
    // Slug must be lowercase alphanumeric with hyphens, 1-200 chars
    return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(slug) && slug.length <= 200;
  }
}
