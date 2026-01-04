import { DayConfigRepository } from '@/server/repositories/dayConfigRepository';
import { UploadedImageRepository } from '@/server/repositories/uploadedImageRepository';
import { uploadImage as uploadToBlob, deleteFile as deleteFromBlob, } from '@/server/connections/storage/storage';
/**
 * DayConfigService
 *
 * Manages day-specific configurations (images, themes, etc.) for the calendar.
 * Configurations can be global (apply to all users) or scoped to specific users/groups.
 * Also manages the image library for uploaded images.
 */
export class DayConfigService {
    static instance;
    dayConfigRepo;
    imageRepo;
    constructor() {
        this.dayConfigRepo = new DayConfigRepository();
        this.imageRepo = new UploadedImageRepository();
    }
    static getInstance() {
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
    async getConfigForDate(date) {
        return this.dayConfigRepo.getByDate(date);
    }
    /**
     * Get configs for a month (for calendar view)
     * Returns all global configs for the specified month
     */
    async getConfigsForMonth(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of month
        return this.dayConfigRepo.getByDateRange(startDate, endDate);
    }
    /**
     * Upsert config for a date (merges with existing config)
     */
    async upsertConfig(date, config) {
        return this.dayConfigRepo.upsert(date, config);
    }
    /**
     * Set image for a specific date
     */
    async setDayImage(date, imageUrl, imageName) {
        return this.dayConfigRepo.upsert(date, {
            imageUrl,
            imageName: imageName ?? undefined,
        });
    }
    /**
     * Clear config for a date (removes entire config)
     */
    async clearConfig(date) {
        return this.dayConfigRepo.deleteByDate(date);
    }
    /**
     * Get image URL for a date (used by daily message service)
     * Returns null if no custom image is set
     */
    async getImageUrlForDate(date) {
        const config = await this.dayConfigRepo.getByDate(date);
        return config?.config?.imageUrl ?? null;
    }
    // =====================
    // Image Library Methods
    // =====================
    /**
     * Upload a new image to the library
     */
    async uploadImage(file, filename, contentType, options) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${filename}`;
        // Upload to Vercel Blob
        const url = await uploadToBlob(uniqueFilename, file, {
            folder: 'day-images',
            contentType,
        });
        // Store metadata in DB
        const imageData = {
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
    async getImageLibrary(category) {
        return this.imageRepo.list({ category });
    }
    /**
     * Get an image by ID
     */
    async getImageById(id) {
        return this.imageRepo.getById(id);
    }
    /**
     * Delete an image from the library
     * Also removes from Vercel Blob storage
     */
    async deleteImage(id) {
        const image = await this.imageRepo.getById(id);
        if (!image) {
            return;
        }
        // Delete from Vercel Blob
        try {
            await deleteFromBlob(image.url);
        }
        catch (error) {
            console.error(`[DayConfigService] Failed to delete blob ${image.url}:`, error);
            // Continue with DB deletion even if blob deletion fails
        }
        // Delete from DB
        await this.imageRepo.delete(id);
    }
    /**
     * Update image metadata
     */
    async updateImageMetadata(id, data) {
        return this.imageRepo.update(id, data);
    }
}
export const dayConfigService = DayConfigService.getInstance();
