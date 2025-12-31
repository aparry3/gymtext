/**
 * Uploaded Image Model
 *
 * Represents an image uploaded to the image library.
 * Images are stored in Vercel Blob and metadata is tracked here.
 */

import { Selectable, Insertable } from 'kysely';
import { UploadedImages } from './_types';

/**
 * Type for selecting uploaded images from the database
 */
export type UploadedImage = Selectable<UploadedImages>;

/**
 * Type for inserting uploaded images into the database
 */
export type NewUploadedImage = Insertable<UploadedImages>;

/**
 * Image categories for organization
 */
export type ImageCategory = 'holiday' | 'seasonal' | 'general';

/**
 * Default category for uploaded images
 */
export const DEFAULT_IMAGE_CATEGORY: ImageCategory = 'general';
