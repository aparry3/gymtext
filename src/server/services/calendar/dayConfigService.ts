import { DayConfigRepository } from '@/server/repositories/dayConfigRepository';
import { UploadedImageRepository } from '@/server/repositories/uploadedImageRepository';
import {
  uploadImage as uploadToBlob,
  deleteFile as deleteFromBlob,
} from '@/server/connections/storage/storage';
import {
  DayConfigOptions,
  DayConfigWithTypedConfig,
} from '@/server/models/dayConfig';
import { UploadedImage, NewUploadedImage } from '@/server/models/uploadedImage';

/**
 * DayConfigService
 *
 * Manages day-specific configurations (images, themes, etc.) for the calendar.
 * Configurations can be global (apply to all users) or scoped to specific users/groups.
 * Also manages the image library for uploaded images.
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

  // =====================
  // Day Config Methods
  // =====================

  /**
   * Get config for a specific date (global scope)
   */
  async getConfigForDate(date: Date): Promise<DayConfigWithTypedConfig | null> {
    return this.dayConfigRepo.getByDate(date);
  }

  /**
   * Get configs for a month (for calendar view)
   * Returns all global configs for the specified month
   */
  async getConfigsForMonth(
    year: number,
    month: number
  ): Promise<DayConfigWithTypedConfig[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    return this.dayConfigRepo.getByDateRange(startDate, endDate);
  }

  /**
   * Upsert config for a date (merges with existing config)
   */
  async upsertConfig(
    date: Date,
    config: Partial<DayConfigOptions>
  ): Promise<DayConfigWithTypedConfig> {
    return this.dayConfigRepo.upsert(date, config);
  }

  /**
   * Set image for a specific date
   */
  async setDayImage(
    date: Date,
    imageUrl: string,
    imageName?: string
  ): Promise<DayConfigWithTypedConfig> {
    return this.dayConfigRepo.upsert(date, {
      imageUrl,
      imageName: imageName ?? undefined,
    });
  }

  /**
   * Clear config for a date (removes entire config)
   */
  async clearConfig(date: Date): Promise<void> {
    return this.dayConfigRepo.deleteByDate(date);
  }

  /**
   * Get image URL for a date (used by daily message service)
   * Returns null if no custom image is set
   */
  async getImageUrlForDate(date: Date): Promise<string | null> {
    const config = await this.dayConfigRepo.getByDate(date);
    return config?.config?.imageUrl ?? null;
  }

  // =====================
  // Image Library Methods
  // =====================

  /**
   * Upload a new image to the library
   */
  async uploadImage(
    file: Buffer | Blob,
    filename: string,
    contentType: string,
    options?: {
      category?: string;
      displayName?: string;
      uploadedBy?: string;
    }
  ): Promise<UploadedImage> {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Upload to Vercel Blob
    const url = await uploadToBlob(uniqueFilename, file, {
      folder: 'day-images',
      contentType,
    });

    // Store metadata in DB
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

  /**
   * Get image library with optional category filter
   */
  async getImageLibrary(category?: string): Promise<UploadedImage[]> {
    return this.imageRepo.list({ category });
  }

  /**
   * Get an image by ID
   */
  async getImageById(id: string): Promise<UploadedImage | null> {
    return this.imageRepo.getById(id);
  }

  /**
   * Delete an image from the library
   * Also removes from Vercel Blob storage
   */
  async deleteImage(id: string): Promise<void> {
    const image = await this.imageRepo.getById(id);
    if (!image) {
      return;
    }

    // Delete from Vercel Blob
    try {
      await deleteFromBlob(image.url);
    } catch (error) {
      console.error(
        `[DayConfigService] Failed to delete blob ${image.url}:`,
        error
      );
      // Continue with DB deletion even if blob deletion fails
    }

    // Delete from DB
    await this.imageRepo.delete(id);
  }

  /**
   * Update image metadata
   */
  async updateImageMetadata(
    id: string,
    data: Partial<Pick<UploadedImage, 'displayName' | 'category'>>
  ): Promise<UploadedImage> {
    return this.imageRepo.update(id, data);
  }
}

export const dayConfigService = DayConfigService.getInstance();
