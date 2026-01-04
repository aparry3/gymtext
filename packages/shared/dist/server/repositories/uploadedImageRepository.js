import { BaseRepository } from './baseRepository';
/**
 * Repository for managing uploaded images
 * Handles storage and retrieval of image library entries
 */
export class UploadedImageRepository extends BaseRepository {
    /**
     * List all images with optional filtering
     */
    async list(options) {
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
    async getById(id) {
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
    async findByUrl(url) {
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
    async create(image) {
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
    async update(id, data) {
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
    async delete(id) {
        await this.db.deleteFrom('uploadedImages').where('id', '=', id).execute();
    }
}
