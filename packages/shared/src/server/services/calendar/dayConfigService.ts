import {
  uploadImage as uploadToBlob,
  deleteFile as deleteFromBlob,
} from '@/server/connections/storage/storage';
import { DayConfigOptions, DayConfigWithTypedConfig } from '@/server/models/dayConfig';
import { UploadedImage, NewUploadedImage } from '@/server/models/uploadedImage';
import type { RepositoryContainer } from '../../repositories/factory';

/**
 * DayConfigServiceInstance interface
 */
export interface DayConfigServiceInstance {
  getConfigForDate(date: Date): Promise<DayConfigWithTypedConfig | null>;
  getConfigsForMonth(year: number, month: number): Promise<DayConfigWithTypedConfig[]>;
  upsertConfig(date: Date, config: Partial<DayConfigOptions>): Promise<DayConfigWithTypedConfig>;
  setDayImage(date: Date, imageUrl: string, imageName?: string): Promise<DayConfigWithTypedConfig>;
  clearConfig(date: Date): Promise<void>;
  getImageUrlForDate(date: Date): Promise<string | null>;
  uploadImage(
    file: Buffer | Blob,
    filename: string,
    contentType: string,
    options?: { category?: string; displayName?: string; uploadedBy?: string }
  ): Promise<UploadedImage>;
  getImageLibrary(category?: string): Promise<UploadedImage[]>;
  getImageById(id: string): Promise<UploadedImage | null>;
  deleteImage(id: string): Promise<void>;
  updateImageMetadata(id: string, data: Partial<Pick<UploadedImage, 'displayName' | 'category'>>): Promise<UploadedImage>;
}

/**
 * Create a DayConfigService instance with injected repositories
 */
export function createDayConfigService(repos: RepositoryContainer): DayConfigServiceInstance {
  return {
    async getConfigForDate(date: Date): Promise<DayConfigWithTypedConfig | null> {
      return repos.dayConfig.getByDate(date);
    },

    async getConfigsForMonth(year: number, month: number): Promise<DayConfigWithTypedConfig[]> {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      return repos.dayConfig.getByDateRange(startDate, endDate);
    },

    async upsertConfig(date: Date, config: Partial<DayConfigOptions>): Promise<DayConfigWithTypedConfig> {
      return repos.dayConfig.upsert(date, config);
    },

    async setDayImage(date: Date, imageUrl: string, imageName?: string): Promise<DayConfigWithTypedConfig> {
      return repos.dayConfig.upsert(date, {
        imageUrl,
        imageName: imageName ?? undefined,
      });
    },

    async clearConfig(date: Date): Promise<void> {
      return repos.dayConfig.deleteByDate(date);
    },

    async getImageUrlForDate(date: Date): Promise<string | null> {
      const config = await repos.dayConfig.getByDate(date);
      return config?.config?.imageUrl ?? null;
    },

    async uploadImage(
      file: Buffer | Blob,
      filename: string,
      contentType: string,
      options?: { category?: string; displayName?: string; uploadedBy?: string }
    ): Promise<UploadedImage> {
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}-${filename}`;

      const url = await uploadToBlob(uniqueFilename, file, {
        folder: 'day-images',
        contentType,
      });

      const imageData: NewUploadedImage = {
        url,
        filename,
        displayName: options?.displayName ?? filename.replace(/\.[^/.]+$/, ''),
        contentType,
        sizeBytes: file instanceof Buffer ? file.length : 0,
        category: options?.category ?? 'general',
        uploadedBy: options?.uploadedBy ?? null,
      };

      return repos.uploadedImage.create(imageData);
    },

    async getImageLibrary(category?: string): Promise<UploadedImage[]> {
      return repos.uploadedImage.list({ category });
    },

    async getImageById(id: string): Promise<UploadedImage | null> {
      return repos.uploadedImage.getById(id);
    },

    async deleteImage(id: string): Promise<void> {
      const image = await repos.uploadedImage.getById(id);
      if (!image) {
        return;
      }

      try {
        await deleteFromBlob(image.url);
      } catch (error) {
        console.error(`[DayConfigService] Failed to delete blob ${image.url}:`, error);
      }

      await repos.uploadedImage.delete(id);
    },

    async updateImageMetadata(
      id: string,
      data: Partial<Pick<UploadedImage, 'displayName' | 'category'>>
    ): Promise<UploadedImage> {
      return repos.uploadedImage.update(id, data);
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { DayConfigRepository } from '@/server/repositories/dayConfigRepository';
import { UploadedImageRepository } from '@/server/repositories/uploadedImageRepository';

/**
 * @deprecated Use createDayConfigService(repos) instead
 */
export class DayConfigService {
  private static instance: DayConfigService;
  private dayConfigRepo: DayConfigRepository;
  private imageRepo: UploadedImageRepository;

  private constructor() {
    this.dayConfigRepo = new DayConfigRepository();
    this.imageRepo = new UploadedImageRepository();
  }

  public static getInstance(): DayConfigService {
    if (!DayConfigService.instance) {
      DayConfigService.instance = new DayConfigService();
    }
    return DayConfigService.instance;
  }

  async getConfigForDate(date: Date): Promise<DayConfigWithTypedConfig | null> {
    return this.dayConfigRepo.getByDate(date);
  }

  async getConfigsForMonth(year: number, month: number): Promise<DayConfigWithTypedConfig[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return this.dayConfigRepo.getByDateRange(startDate, endDate);
  }

  async upsertConfig(date: Date, config: Partial<DayConfigOptions>): Promise<DayConfigWithTypedConfig> {
    return this.dayConfigRepo.upsert(date, config);
  }

  async setDayImage(date: Date, imageUrl: string, imageName?: string): Promise<DayConfigWithTypedConfig> {
    return this.dayConfigRepo.upsert(date, {
      imageUrl,
      imageName: imageName ?? undefined,
    });
  }

  async clearConfig(date: Date): Promise<void> {
    return this.dayConfigRepo.deleteByDate(date);
  }

  async getImageUrlForDate(date: Date): Promise<string | null> {
    const config = await this.dayConfigRepo.getByDate(date);
    return config?.config?.imageUrl ?? null;
  }

  async uploadImage(
    file: Buffer | Blob,
    filename: string,
    contentType: string,
    options?: { category?: string; displayName?: string; uploadedBy?: string }
  ): Promise<UploadedImage> {
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;

    const url = await uploadToBlob(uniqueFilename, file, {
      folder: 'day-images',
      contentType,
    });

    const imageData: NewUploadedImage = {
      url,
      filename,
      displayName: options?.displayName ?? filename.replace(/\.[^/.]+$/, ''),
      contentType,
      sizeBytes: file instanceof Buffer ? file.length : 0,
      category: options?.category ?? 'general',
      uploadedBy: options?.uploadedBy ?? null,
    };

    return this.imageRepo.create(imageData);
  }

  async getImageLibrary(category?: string): Promise<UploadedImage[]> {
    return this.imageRepo.list({ category });
  }

  async getImageById(id: string): Promise<UploadedImage | null> {
    return this.imageRepo.getById(id);
  }

  async deleteImage(id: string): Promise<void> {
    const image = await this.imageRepo.getById(id);
    if (!image) {
      return;
    }

    try {
      await deleteFromBlob(image.url);
    } catch (error) {
      console.error(`[DayConfigService] Failed to delete blob ${image.url}:`, error);
    }

    await this.imageRepo.delete(id);
  }

  async updateImageMetadata(
    id: string,
    data: Partial<Pick<UploadedImage, 'displayName' | 'category'>>
  ): Promise<UploadedImage> {
    return this.imageRepo.update(id, data);
  }
}

/**
 * @deprecated Use createDayConfigService(repos) instead
 */
export const dayConfigService = DayConfigService.getInstance();
