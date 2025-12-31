import { BaseRepository } from './baseRepository';
import { UploadedImage, NewUploadedImage } from '../models/uploadedImage';

/**
 * Repository for managing uploaded images
 * Handles storage and retrieval of image library entries
 */
export class UploadedImageRepository extends BaseRepository {
  /**
   * List all images with optional filtering
   */
  async list(options?: {
    category?: string;
    limit?: number;
  }): Promise<UploadedImage[]> {
    let query = this.db
      .selectFrom('uploadedImages')
      .selectAll()
      .orderBy('createdAt', 'desc');

    if (options?.category) {
      query = query.where('category', '=', options.category);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return query.execute();
  }

  /**
   * Get an image by ID
   */
  async getById(id: string): Promise<UploadedImage | null> {
    const result = await this.db
      .selectFrom('uploadedImages')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result || null;
  }

  /**
   * Find an image by URL
   */
  async findByUrl(url: string): Promise<UploadedImage | null> {
    const result = await this.db
      .selectFrom('uploadedImages')
      .selectAll()
      .where('url', '=', url)
      .executeTakeFirst();

    return result || null;
  }

  /**
   * Create a new image record
   */
  async create(image: NewUploadedImage): Promise<UploadedImage> {
    const result = await this.db
      .insertInto('uploadedImages')
      .values({
        ...image,
        createdAt: new Date(),
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Update an image's metadata
   */
  async update(
    id: string,
    data: Partial<Pick<UploadedImage, 'displayName' | 'category' | 'tags'>>
  ): Promise<UploadedImage> {
    const result = await this.db
      .updateTable('uploadedImages')
      .set(data)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return result;
  }

  /**
   * Delete an image by ID
   */
  async delete(id: string): Promise<void> {
    await this.db.deleteFrom('uploadedImages').where('id', '=', id).execute();
  }
}
