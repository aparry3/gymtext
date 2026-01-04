/**
 * Session crypto utilities for Edge Runtime (middleware)
 * Uses Web Crypto API instead of Node.js crypto module
 *
 * NOTE: This file runs in Edge Runtime and cannot import from @/server/config
 * (which uses 'server-only' and Node.js modules). Direct process.env access
 * is an accepted exception for this file.
 */
/**
 * Encrypt a user ID for use in a session cookie (Edge Runtime compatible)
 * Returns a base64-encoded string containing IV + encrypted data
 */
export declare function encryptUserId(userId: string): Promise<string>;
/**
 * Decrypt a user ID from a session cookie (Edge Runtime compatible)
 * Returns the user ID or null if decryption fails
 */
export declare function decryptUserId(encryptedData: string): Promise<string | null>;
//# sourceMappingURL=sessionCryptoEdge.d.ts.map