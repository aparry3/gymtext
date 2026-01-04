import { BaseRepository } from './baseRepository';
import { UploadedImage, NewUploadedImage } from '../models/uploadedImage';
/**
 * Repository for managing uploaded images
 * Handles storage and retrieval of image library entries
 */
export declare class UploadedImageRepository extends BaseRepository {
    /**
     * List all images with optional filtering
     */
    list(options?: {
        category?: string;
        limit?: number;
    }): Promise<UploadedImage[]>;
    /**
     * Get an image by ID
     */
    getById(id: string): Promise<UploadedImage | null>;
    /**
     * Find an image by URL
     */
    findByUrl(url: string): Promise<UploadedImage | null>;
    /**
     * Create a new image record
     */
    create(image: NewUploadedImage): Promise<UploadedImage>;
    /**
     * Update an image's metadata
     */
    update(id: string, data: Partial<Pick<UploadedImage, 'displayName' | 'category' | 'tags'>>): Promise<UploadedImage>;
    /**
     * Delete an image by ID
     */
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=uploadedImageRepository.d.ts.map