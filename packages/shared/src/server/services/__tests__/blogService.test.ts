import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBlogService } from '../domain/blog/blogService';
import type { BlogServiceInstance } from '../domain/blog/blogService';

// Mock BlogPostModel
vi.mock('../../../models/blogPost', async (importOriginal) => {
  const original = await importOriginal() as Record<string, any>;
  return {
    ...original,
    BlogPostModel: {
      generateSlug: vi.fn((title: string) => title.toLowerCase().replace(/\s+/g, '-')),
      calculateReadingTime: vi.fn(() => 3),
    },
  };
});

function makePost(overrides: Record<string, any> = {}) {
  return {
    id: 'post-1',
    ownerId: 'owner-1',
    slug: 'test-post',
    title: 'Test Post',
    description: 'A test post',
    content: 'Hello world',
    coverImageId: null,
    coverImageUrl: null,
    status: 'draft',
    tags: '[]',
    publishedAt: null,
    readingTimeMinutes: 3,
    viewCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    blogPost: {
      findById: vi.fn().mockResolvedValue(makePost()),
      findPublishedBySlug: vi.fn().mockResolvedValue(makePost({ status: 'published' })),
      listPublished: vi.fn().mockResolvedValue({ posts: [makePost()], total: 1 }),
      listPopular: vi.fn().mockResolvedValue([makePost()]),
      listTags: vi.fn().mockResolvedValue([{ tag: 'fitness', count: 5 }]),
      incrementViewCount: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue(makePost()),
      findByOwnerId: vi.fn().mockResolvedValue([makePost()]),
      update: vi.fn().mockResolvedValue(makePost({ status: 'published' })),
      delete: vi.fn().mockResolvedValue(true),
      isSlugUnique: vi.fn().mockResolvedValue(true),
    },
  } as any;
}

describe('BlogService', () => {
  let service: BlogServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createBlogService(repos);
  });

  // Public methods
  describe('getPublishedBySlug', () => {
    it('should return published post by slug', async () => {
      const result = await service.getPublishedBySlug('test-post');
      expect(repos.blogPost.findPublishedBySlug).toHaveBeenCalledWith('test-post');
      expect(result).not.toBeNull();
    });
  });

  describe('listPublished', () => {
    it('should return published posts with total', async () => {
      const result = await service.listPublished({ limit: 10 });
      expect(result).toEqual({ posts: expect.any(Array), total: 1 });
    });
  });

  describe('listPopular', () => {
    it('should return popular posts with default limit', async () => {
      await service.listPopular();
      expect(repos.blogPost.listPopular).toHaveBeenCalledWith(5);
    });

    it('should pass custom limit', async () => {
      await service.listPopular(10);
      expect(repos.blogPost.listPopular).toHaveBeenCalledWith(10);
    });
  });

  describe('listTags', () => {
    it('should return tag counts', async () => {
      const result = await service.listTags();
      expect(result).toEqual([{ tag: 'fitness', count: 5 }]);
    });
  });

  describe('trackView', () => {
    it('should increment view count', async () => {
      await service.trackView('post-1');
      expect(repos.blogPost.incrementViewCount).toHaveBeenCalledWith('post-1');
    });
  });

  // Management methods
  describe('create', () => {
    it('should create a blog post with auto-generated slug', async () => {
      await service.create('owner-1', { title: 'My Post', content: 'Content here' });
      expect(repos.blogPost.create).toHaveBeenCalledWith(expect.objectContaining({
        ownerId: 'owner-1',
        slug: 'my-post',
        title: 'My Post',
        status: 'draft',
      }));
    });

    it('should use custom slug when provided', async () => {
      await service.create('owner-1', { title: 'My Post', slug: 'custom-slug', content: 'Content' });
      expect(repos.blogPost.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'custom-slug',
      }));
    });

    it('should handle slug uniqueness conflicts', async () => {
      repos.blogPost.isSlugUnique
        .mockResolvedValueOnce(false) // 'my-post' taken
        .mockResolvedValueOnce(true); // 'my-post-1' available

      await service.create('owner-1', { title: 'My Post', content: 'Content' });
      expect(repos.blogPost.create).toHaveBeenCalledWith(expect.objectContaining({
        slug: 'my-post-1',
      }));
    });

    it('should set tags as JSON string', async () => {
      await service.create('owner-1', { title: 'Post', content: 'Content', tags: ['fitness', 'health'] });
      expect(repos.blogPost.create).toHaveBeenCalledWith(expect.objectContaining({
        tags: '["fitness","health"]',
      }));
    });
  });

  describe('getById', () => {
    it('should return post by id', async () => {
      const result = await service.getById('post-1');
      expect(result).toEqual(expect.objectContaining({ id: 'post-1' }));
    });
  });

  describe('update', () => {
    it('should update post when owner matches', async () => {
      const result = await service.update('post-1', 'owner-1', { title: 'Updated Title' });
      expect(repos.blogPost.update).toHaveBeenCalled();
      expect(result).not.toBeNull();
    });

    it('should return null when owner does not match', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(makePost({ ownerId: 'other-owner' }));
      const result = await service.update('post-1', 'owner-1', { title: 'Hack' });
      expect(result).toBeNull();
      expect(repos.blogPost.update).not.toHaveBeenCalled();
    });

    it('should return null when post not found', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(null);
      const result = await service.update('unknown', 'owner-1', { title: 'x' });
      expect(result).toBeNull();
    });

    it('should recalculate reading time when content changes', async () => {
      await service.update('post-1', 'owner-1', { content: 'New longer content' });
      expect(repos.blogPost.update).toHaveBeenCalledWith('post-1', expect.objectContaining({
        content: 'New longer content',
        readingTimeMinutes: expect.any(Number),
      }));
    });
  });

  describe('publish', () => {
    it('should publish a draft post', async () => {
      await service.publish('post-1', 'owner-1');
      expect(repos.blogPost.update).toHaveBeenCalledWith('post-1', expect.objectContaining({
        status: 'published',
        publishedAt: expect.any(Date),
      }));
    });

    it('should return null when owner does not match', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(makePost({ ownerId: 'other' }));
      const result = await service.publish('post-1', 'owner-1');
      expect(result).toBeNull();
    });

    it('should return post as-is when already published', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(makePost({ status: 'published' }));
      const result = await service.publish('post-1', 'owner-1');
      expect(repos.blogPost.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'published' }));
    });
  });

  describe('unpublish', () => {
    it('should unpublish a published post', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(makePost({ status: 'published' }));
      await service.unpublish('post-1', 'owner-1');
      expect(repos.blogPost.update).toHaveBeenCalledWith('post-1', expect.objectContaining({
        status: 'draft',
        publishedAt: null,
      }));
    });

    it('should return post as-is when already draft', async () => {
      const result = await service.unpublish('post-1', 'owner-1');
      expect(repos.blogPost.update).not.toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ status: 'draft' }));
    });
  });

  describe('delete', () => {
    it('should delete post when owner matches', async () => {
      const result = await service.delete('post-1', 'owner-1');
      expect(result).toBe(true);
    });

    it('should return false when owner does not match', async () => {
      repos.blogPost.findById.mockResolvedValueOnce(makePost({ ownerId: 'other' }));
      const result = await service.delete('post-1', 'owner-1');
      expect(result).toBe(false);
    });
  });
});
