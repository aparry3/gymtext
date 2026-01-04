/**
 * Upload an image to Vercel Blob storage
 * @param filename - Name for the file (will be prefixed with path)
 * @param data - File data as Buffer, Blob, or base64 string
 * @param options - Optional upload configuration
 * @returns URL of the uploaded blob
 */
export declare function uploadImage(filename: string, data: Buffer | Blob | string, options?: {
    folder?: string;
    contentType?: string;
}): Promise<string>;
/**
 * Delete a file by URL
 */
export declare function deleteFile(url: string): Promise<void>;
/**
 * List files with optional prefix filter
 */
export declare function listFiles(prefix?: string): Promise<import("@vercel/blob").ListBlobResult>;
/**
 * Get file metadata by URL
 */
export declare function getFileMetadata(url: string): Promise<import("@vercel/blob").HeadBlobResult>;
//# sourceMappingURL=storage.d.ts.map