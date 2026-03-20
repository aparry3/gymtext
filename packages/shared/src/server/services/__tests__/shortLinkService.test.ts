import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createShortLinkService } from '../domain/links/shortLinkService';
import type { ShortLinkServiceInstance } from '../domain/links/shortLinkService';

// Mock the config module
vi.mock('@/shared/config', () => ({
  getShortLinksConfig: vi.fn(() => ({
    defaultExpiryDays: 7,
    domain: 'https://gtxt.ai',
  })),
}));

function makeLink(overrides: Record<string, any> = {}) {
  return {
    id: 'link-1',
    code: 'abc123',
    targetPath: '/me/workouts/w-1',
    clientId: 'user-1',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accessCount: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    shortLink: {
      generateUniqueCode: vi.fn().mockReturnValue('gen-code'),
      createShortLink: vi.fn().mockResolvedValue(makeLink()),
      findByCode: vi.fn().mockResolvedValue(makeLink()),
      incrementAccessCount: vi.fn().mockResolvedValue(undefined),
      deleteExpiredLinks: vi.fn().mockResolvedValue(5),
    },
  } as any;
}

describe('ShortLinkService', () => {
  let service: ShortLinkServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createShortLinkService(repos);
  });

  describe('createShortLink', () => {
    it('should create a short link with generated code', async () => {
      const result = await service.createShortLink('user-1', '/me/workouts/w-1');

      expect(repos.shortLink.generateUniqueCode).toHaveBeenCalled();
      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'gen-code',
          targetPath: '/me/workouts/w-1',
          clientId: 'user-1',
          expiresAt: expect.any(Date),
        })
      );
      expect(result).toEqual(expect.objectContaining({ id: 'link-1' }));
    });

    it('should use custom code when provided', async () => {
      await service.createShortLink('user-1', '/me', { code: 'custom-code' });

      expect(repos.shortLink.generateUniqueCode).not.toHaveBeenCalled();
      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'custom-code' })
      );
    });

    it('should use custom expiry when provided', async () => {
      const customExpiry = new Date('2026-12-31');
      await service.createShortLink('user-1', '/me', { expiresAt: customExpiry });

      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: customExpiry })
      );
    });

    it('should set default expiry of 7 days', async () => {
      const before = Date.now();
      await service.createShortLink('user-1', '/me');
      const after = Date.now();

      const call = repos.shortLink.createShortLink.mock.calls[0][0];
      const expiryTime = call.expiresAt.getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

      expect(expiryTime).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
      expect(expiryTime).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
    });
  });

  describe('resolveShortLink', () => {
    it('should resolve a valid, non-expired link', async () => {
      const result = await service.resolveShortLink('abc123');

      expect(repos.shortLink.findByCode).toHaveBeenCalledWith('abc123');
      expect(result).toEqual(expect.objectContaining({ isExpired: false }));
      expect(result!.link).toEqual(expect.objectContaining({ code: 'abc123' }));
    });

    it('should increment access count for valid links', async () => {
      await service.resolveShortLink('abc123');

      expect(repos.shortLink.incrementAccessCount).toHaveBeenCalledWith('link-1');
    });

    it('should return null for unknown code', async () => {
      repos.shortLink.findByCode.mockResolvedValueOnce(null);

      const result = await service.resolveShortLink('unknown');
      expect(result).toBeNull();
    });

    it('should mark expired links as expired', async () => {
      const expiredLink = makeLink({
        expiresAt: new Date(Date.now() - 1000).toISOString(), // expired 1 second ago
      });
      repos.shortLink.findByCode.mockResolvedValueOnce(expiredLink);

      const result = await service.resolveShortLink('abc123');

      expect(result).toEqual(expect.objectContaining({ isExpired: true }));
      expect(repos.shortLink.incrementAccessCount).not.toHaveBeenCalled();
    });

    it('should treat null expiresAt as non-expired', async () => {
      const noExpiryLink = makeLink({ expiresAt: null });
      repos.shortLink.findByCode.mockResolvedValueOnce(noExpiryLink);

      const result = await service.resolveShortLink('abc123');
      expect(result).toEqual(expect.objectContaining({ isExpired: false }));
    });

    it('should not throw if incrementAccessCount fails', async () => {
      repos.shortLink.incrementAccessCount.mockRejectedValueOnce(new Error('DB error'));

      // Should not throw — error is caught internally
      const result = await service.resolveShortLink('abc123');
      expect(result).not.toBeNull();
    });
  });

  describe('createWorkoutLink', () => {
    it('should create a link with workout path', async () => {
      await service.createWorkoutLink('user-1', 'workout-42');

      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({
          targetPath: '/me/workouts/workout-42',
          clientId: 'user-1',
        })
      );
    });

    it('should pass through options', async () => {
      await service.createWorkoutLink('user-1', 'w-1', { code: 'wkt-code' });

      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'wkt-code' })
      );
    });
  });

  describe('createProfileLink', () => {
    it('should create a link with /me path', async () => {
      await service.createProfileLink('user-1');

      expect(repos.shortLink.createShortLink).toHaveBeenCalledWith(
        expect.objectContaining({
          targetPath: '/me',
          clientId: 'user-1',
        })
      );
    });
  });

  describe('getFullUrl', () => {
    it('should return full URL with configured domain', () => {
      const url = service.getFullUrl('abc123');
      expect(url).toBe('https://gtxt.ai/l/abc123');
    });
  });

  describe('cleanupExpiredLinks', () => {
    it('should delete expired links and return count', async () => {
      const count = await service.cleanupExpiredLinks();

      expect(repos.shortLink.deleteExpiredLinks).toHaveBeenCalled();
      expect(count).toBe(5);
    });

    it('should return 0 on error', async () => {
      repos.shortLink.deleteExpiredLinks.mockRejectedValueOnce(new Error('DB error'));

      const count = await service.cleanupExpiredLinks();
      expect(count).toBe(0);
    });
  });
});
