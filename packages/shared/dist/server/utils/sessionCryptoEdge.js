/**
 * Session crypto utilities for Edge Runtime (middleware)
 * Uses Web Crypto API instead of Node.js crypto module
 *
 * NOTE: This file runs in Edge Runtime and cannot import from @/server/config
 * (which uses 'server-only' and Node.js modules). Direct process.env access
 * is an accepted exception for this file.
 */
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // Recommended for GCM
const KEY_LENGTH = 256; // bits
/**
 * Get or derive the encryption key for Edge Runtime
 */
async function getEncryptionKey() {
    // Edge runtime exception - cannot use server config module
    const keyString = process.env.SESSION_ENCRYPTION_KEY || 'gymtext-dev-key';
    // Encode the key string
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(keyString);
    // Import key material
    const importedKey = await crypto.subtle.importKey('raw', keyMaterial, { name: 'PBKDF2' }, false, ['deriveBits', 'deriveKey']);
    // Derive actual encryption key using PBKDF2
    const salt = encoder.encode('gymtext-salt'); // Fixed salt for deterministic key derivation
    const key = await crypto.subtle.deriveKey({
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256'
    }, importedKey, { name: ALGORITHM, length: KEY_LENGTH }, false, ['encrypt', 'decrypt']);
    return key;
}
/**
 * Encrypt a user ID for use in a session cookie (Edge Runtime compatible)
 * Returns a base64-encoded string containing IV + encrypted data
 */
export async function encryptUserId(userId) {
    try {
        const key = await getEncryptionKey();
        const encoder = new TextEncoder();
        const data = encoder.encode(userId);
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        // Encrypt the data
        const encrypted = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, data);
        // Combine IV + encrypted data
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encrypted), iv.length);
        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    }
    catch (error) {
        console.error('Error encrypting user ID:', error);
        throw new Error('Failed to encrypt session');
    }
}
/**
 * Decrypt a user ID from a session cookie (Edge Runtime compatible)
 * Returns the user ID or null if decryption fails
 */
export async function decryptUserId(encryptedData) {
    try {
        const key = await getEncryptionKey();
        // Decode from base64
        const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encrypted = combined.slice(IV_LENGTH);
        // Decrypt the data
        const decrypted = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, encrypted);
        // Convert to string
        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }
    catch (error) {
        console.error('Error decrypting user ID:', error);
        return null;
    }
}
