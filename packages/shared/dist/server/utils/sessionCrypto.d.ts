/**
 * Encrypt a user ID for use in a session cookie
 * Returns a base64-encoded string containing IV + authTag + encrypted data
 */
export declare function encryptUserId(userId: string): string;
/**
 * Decrypt a user ID from a session cookie
 * Returns the user ID or null if decryption fails
 */
export declare function decryptUserId(encryptedData: string): string | null;
/**
 * Generate a secure random encryption key for SESSION_ENCRYPTION_KEY
 * This is a utility function for generating a new key - run once and store securely
 */
export declare function generateEncryptionKey(): string;
//# sourceMappingURL=sessionCrypto.d.ts.map