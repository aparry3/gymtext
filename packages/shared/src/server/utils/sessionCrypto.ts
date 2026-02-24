import crypto from 'crypto';
import { getDatabaseSecrets } from '@/server/config';

/**
 * Session crypto utilities for encrypting and decrypting user IDs in session cookies
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For GCM mode
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Get the encryption key from config
 * In production, this should be a strong random key stored securely
 */
function getEncryptionKey(): Buffer {
  const { sessionEncryptionKey } = getDatabaseSecrets();

  if (!sessionEncryptionKey) {
    // For development, use a default key (NOT for production!)
    console.warn('SESSION_ENCRYPTION_KEY not set, using development key');
    return crypto.scryptSync('gymtext-dev-key', 'salt', KEY_LENGTH);
  }

  // If key is hex-encoded, decode it
  if (sessionEncryptionKey.length === KEY_LENGTH * 2) {
    return Buffer.from(sessionEncryptionKey, 'hex');
  }

  // Otherwise, derive key from string
  return crypto.scryptSync(sessionEncryptionKey, 'salt', KEY_LENGTH);
}

/**
 * Encrypt a user ID for use in a session cookie
 * Returns a base64-encoded string containing IV + authTag + encrypted data
 */
export function encryptUserId(userId: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(userId, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine IV + authTag + encrypted data
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('Error encrypting user ID:', error);
    throw new Error('Failed to encrypt session');
  }
}

/**
 * Decrypt a user ID from a session cookie
 * Returns the user ID or null if decryption fails
 */
export function decryptUserId(encryptedData: string): string | null {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract IV, authTag, and encrypted data
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error decrypting user ID:', error);
    return null;
  }
}

/**
 * Generate a secure random encryption key for SESSION_ENCRYPTION_KEY
 * This is a utility function for generating a new key - run once and store securely
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

// =============================================================================
// Impersonation Tokens
// =============================================================================

interface ImpersonationPayload {
  userId: string;
  exp: number;
  nonce: string;
  adminBackUrl?: string;
}

interface CreateImpersonationTokenOptions {
  /** Token TTL in seconds (default: 300 = 5 minutes) */
  ttlSeconds?: number;
  /** URL to return to in admin app */
  adminBackUrl?: string;
}

/**
 * Create a time-limited encrypted impersonation token.
 * Uses base64url encoding for URL safety.
 */
export function createImpersonationToken(
  userId: string,
  options: CreateImpersonationTokenOptions = {}
): string {
  const { ttlSeconds = 300, adminBackUrl } = options;

  const payload: ImpersonationPayload = {
    userId,
    exp: Date.now() + ttlSeconds * 1000,
    nonce: crypto.randomBytes(16).toString('hex'),
    ...(adminBackUrl && { adminBackUrl }),
  };

  const plaintext = JSON.stringify(payload);
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex'),
  ]);

  // Use base64url encoding for URL safety
  return combined.toString('base64url');
}

/**
 * Validate and decrypt an impersonation token.
 * Returns the payload if valid and not expired, or null otherwise.
 */
export function validateImpersonationToken(
  token: string
): ImpersonationPayload | null {
  try {
    const key = getEncryptionKey();
    const combined = Buffer.from(token, 'base64url');

    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    const payload: ImpersonationPayload = JSON.parse(decrypted);

    // Check expiry
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
