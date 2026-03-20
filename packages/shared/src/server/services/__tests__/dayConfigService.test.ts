import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createDayConfigService } from '../domain/calendar/dayConfigService';
import type { DayConfigServiceInstance } from '../domain/calendar/dayConfigService';

// Mock blob storage
vi.mock('@/server/connections/storage/storage', () => ({
  uploadImage: vi.fn().mockResolvedValue('https://blob.example.com/day-images/123-photo.jpg'),
  deleteFile: vi.fn().mockResolvedValue(undefined),
}));

function makeConfig(overrides: Record<string, any> = {}) {
  return {
    id: 'dc-1',
    date: '2026-03-20',
    config: { imageUrl: 'https://example.com/img.jpg', imageName: 'test-image' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeImage(overrides: Record<string, any> = {}) {
  return {
    id: 'img-1',
    url: 'https://blob.example.com/day-images/photo.jpg',
    filename: 'photo.jpg',
    displayName: 'photo',
    contentType: 'image/jpeg',
    sizeBytes: 1024,
    category: 'general',
    uploadedBy: null,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    dayConfig: {
      getByDate: vi.fn().mockResolvedValue(makeConfig()),
      getByDateRange: vi.fn().mockResolvedValue([makeConfig()]),
      upsert: vi.fn().mockResolvedValue(makeConfig()),
      deleteByDate: vi.fn().mockResolvedValue(undefined),
    },
    uploadedImage: {
      create: vi.fn().mockResolvedValue(makeImage()),
      list: vi.fn().mockResolvedValue([makeImage()]),
      getById: vi.fn().mockResolvedValue(makeImage()),
      delete: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(makeImage({ displayName: 'updated' })),
    },
  } as any;
}

describe('DayConfigService', () => {
  let service: DayConfigServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createDayConfigService(repos);
  });

  describe('getConfigForDate', () => {
    it('should return config for a date', async () => {
      const result = await service.getConfigForDate(new Date('2026-03-20'));
      expect(repos.dayConfig.getByDate).toHaveBeenCalledWith(new Date('2026-03-20'));
      expect(result).toEqual(expect.objectContaining({ id: 'dc-1' }));
    });

    it('should return null when no config exists', async () => {
      repos.dayConfig.getByDate.mockResolvedValueOnce(null);
      const result = await service.getConfigForDate(new Date('2026-01-01'));
      expect(result).toBeNull();
    });
  });

  describe('getConfigsForMonth', () => {
    it('should query correct date range for a month', async () => {
      await service.getConfigsForMonth(2026, 3);

      const [startDate, endDate] = repos.dayConfig.getByDateRange.mock.calls[0];
      expect(startDate.getFullYear()).toBe(2026);
      expect(startDate.getMonth()).toBe(2); // March (0-indexed)
      expect(startDate.getDate()).toBe(1);
      expect(endDate.getMonth()).toBe(2);
      expect(endDate.getDate()).toBe(31); // March has 31 days
    });

    it('should return array of configs', async () => {
      const result = await service.getConfigsForMonth(2026, 3);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('upsertConfig', () => {
    it('should upsert with partial config', async () => {
      const date = new Date('2026-03-20');
      await service.upsertConfig(date, { imageUrl: 'https://new.com/img.png' });

      expect(repos.dayConfig.upsert).toHaveBeenCalledWith(date, { imageUrl: 'https://new.com/img.png' });
    });
  });

  describe('setDayImage', () => {
    it('should upsert with image URL', async () => {
      const date = new Date('2026-03-20');
      await service.setDayImage(date, 'https://example.com/new.jpg', 'sunset');

      expect(repos.dayConfig.upsert).toHaveBeenCalledWith(date, {
        imageUrl: 'https://example.com/new.jpg',
        imageName: 'sunset',
      });
    });

    it('should handle missing image name', async () => {
      const date = new Date('2026-03-20');
      await service.setDayImage(date, 'https://example.com/new.jpg');

      expect(repos.dayConfig.upsert).toHaveBeenCalledWith(date, {
        imageUrl: 'https://example.com/new.jpg',
        imageName: undefined,
      });
    });
  });

  describe('clearConfig', () => {
    it('should delete config for date', async () => {
      const date = new Date('2026-03-20');
      await service.clearConfig(date);
      expect(repos.dayConfig.deleteByDate).toHaveBeenCalledWith(date);
    });
  });

  describe('getImageUrlForDate', () => {
    it('should return image URL when config has one', async () => {
      const url = await service.getImageUrlForDate(new Date('2026-03-20'));
      expect(url).toBe('https://example.com/img.jpg');
    });

    it('should return null when no config', async () => {
      repos.dayConfig.getByDate.mockResolvedValueOnce(null);
      const url = await service.getImageUrlForDate(new Date('2026-01-01'));
      expect(url).toBeNull();
    });

    it('should return null when config has no image', async () => {
      repos.dayConfig.getByDate.mockResolvedValueOnce(makeConfig({ config: {} }));
      const url = await service.getImageUrlForDate(new Date('2026-03-20'));
      expect(url).toBeNull();
    });
  });

  describe('uploadImage', () => {
    it('should upload and create image record', async () => {
      const buffer = Buffer.from('fake-image');
      const result = await service.uploadImage(buffer, 'photo.jpg', 'image/jpeg');

      expect(repos.uploadedImage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://blob.example.com/day-images/123-photo.jpg',
          filename: 'photo.jpg',
          contentType: 'image/jpeg',
          category: 'general',
        })
      );
      expect(result).toEqual(expect.objectContaining({ id: 'img-1' }));
    });

    it('should pass through category and display name', async () => {
      const buffer = Buffer.from('fake');
      await service.uploadImage(buffer, 'hero.png', 'image/png', {
        category: 'hero',
        displayName: 'Hero Image',
        uploadedBy: 'admin-1',
      });

      expect(repos.uploadedImage.create).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'hero',
          displayName: 'Hero Image',
          uploadedBy: 'admin-1',
        })
      );
    });
  });

  describe('getImageLibrary', () => {
    it('should list images', async () => {
      const result = await service.getImageLibrary();
      expect(repos.uploadedImage.list).toHaveBeenCalledWith({ category: undefined });
      expect(result).toHaveLength(1);
    });

    it('should filter by category', async () => {
      await service.getImageLibrary('hero');
      expect(repos.uploadedImage.list).toHaveBeenCalledWith({ category: 'hero' });
    });
  });

  describe('getImageById', () => {
    it('should return image', async () => {
      const result = await service.getImageById('img-1');
      expect(result).toEqual(expect.objectContaining({ id: 'img-1' }));
    });

    it('should return null when not found', async () => {
      repos.uploadedImage.getById.mockResolvedValueOnce(null);
      const result = await service.getImageById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('deleteImage', () => {
    it('should delete blob and record', async () => {
      const { deleteFile } = await import('@/server/connections/storage/storage');
      await service.deleteImage('img-1');

      expect(repos.uploadedImage.getById).toHaveBeenCalledWith('img-1');
      expect(deleteFile).toHaveBeenCalledWith('https://blob.example.com/day-images/photo.jpg');
      expect(repos.uploadedImage.delete).toHaveBeenCalledWith('img-1');
    });

    it('should no-op when image not found', async () => {
      repos.uploadedImage.getById.mockResolvedValueOnce(null);
      await service.deleteImage('unknown');
      expect(repos.uploadedImage.delete).not.toHaveBeenCalled();
    });

    it('should still delete record if blob deletion fails', async () => {
      const { deleteFile } = await import('@/server/connections/storage/storage');
      (deleteFile as any).mockRejectedValueOnce(new Error('Blob error'));

      await service.deleteImage('img-1');
      expect(repos.uploadedImage.delete).toHaveBeenCalledWith('img-1');
    });
  });

  describe('updateImageMetadata', () => {
    it('should update metadata', async () => {
      const result = await service.updateImageMetadata('img-1', { displayName: 'updated' });
      expect(repos.uploadedImage.update).toHaveBeenCalledWith('img-1', { displayName: 'updated' });
      expect(result.displayName).toBe('updated');
    });
  });
});
