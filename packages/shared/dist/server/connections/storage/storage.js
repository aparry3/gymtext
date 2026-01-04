import { put, del, list, head } from "@vercel/blob";
/**
 * Upload an image to Vercel Blob storage
 * @param filename - Name for the file (will be prefixed with path)
 * @param data - File data as Buffer, Blob, or base64 string
 * @param options - Optional upload configuration
 * @returns URL of the uploaded blob
 */
export async function uploadImage(filename, data, options) {
    const path = options?.folder ? `${options.folder}/${filename}` : filename;
    // Convert base64 string to Buffer if needed
    const content = typeof data === "string"
        ? Buffer.from(data, "base64")
        : data;
    const blob = await put(path, content, {
        access: "public",
        contentType: options?.contentType ?? "image/png",
    });
    return blob.url;
}
/**
 * Delete a file by URL
 */
export async function deleteFile(url) {
    await del(url);
}
/**
 * List files with optional prefix filter
 */
export async function listFiles(prefix) {
    return list({ prefix });
}
/**
 * Get file metadata by URL
 */
export async function getFileMetadata(url) {
    return head(url);
}
