import { DayConfigOptions, DayConfigWithTypedConfig } from '@/server/models/dayConfig';
import { UploadedImage } from '@/server/models/uploadedImage';
/**
 * DayConfigService
 *
 * Manages day-specific configurations (images, themes, etc.) for the calendar.
 * Configurations can be global (apply to all users) or scoped to specific users/groups.
 * Also manages the image library for uploaded images.
 */
export declare class DayConfigService {
    private static instance;
    private dayConfigRepo;
    private imageRepo;
    private constructor();
    static getInstance(): DayConfigService;
    /**
     * Get config for a specific date (global scope)
     */
    getConfigForDate(date: Date): Promise<DayConfigWithTypedConfig | null>;
    /**
     * Get configs for a month (for calendar view)
     * Returns all global configs for the specified month
     */
    getConfigsForMonth(year: number, month: number): Promise<DayConfigWithTypedConfig[]>;
    /**
     * Upsert config for a date (merges with existing config)
     */
    upsertConfig(date: Date, config: Partial<DayConfigOptions>): Promise<DayConfigWithTypedConfig>;
    /**
     * Set image for a specific date
     */
    setDayImage(date: Date, imageUrl: string, imageName?: string): Promise<DayConfigWithTypedConfig>;
    /**
     * Clear config for a date (removes entire config)
     */
    clearConfig(date: Date): Promise<void>;
    /**
     * Get image URL for a date (used by daily message service)
     * Returns null if no custom image is set
     */
    getImageUrlForDate(date: Date): Promise<string | null>;
    /**
     * Upload a new image to the library
     */
    uploadImage(file: Buffer | Blob, filename: string, contentType: string, options?: {
        category?: string;
        displayName?: string;
        uploadedBy?: string;
    }): Promise<UploadedImage>;
    /**
     * Get image library with optional category filter
     */
    getImageLibrary(category?: string): Promise<UploadedImage[]>;
    /**
     * Get an image by ID
     */
    getImageById(id: string): Promise<UploadedImage | null>;
    /**
     * Delete an image from the library
     * Also removes from Vercel Blob storage
     */
    deleteImage(id: string): Promise<void>;
    /**
     * Update image metadata
     */
    updateImageMetadata(id: string, data: Partial<Pick<UploadedImage, 'displayName' | 'category'>>): Promise<UploadedImage>;
}
export declare const dayConfigService: DayConfigService;
//# sourceMappingURL=dayConfigService.d.ts.map