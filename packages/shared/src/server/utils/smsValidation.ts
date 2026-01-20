/**
 * SMS Validation Utility
 *
 * Provides functions for validating SMS message length constraints.
 * Uses the smsMaxLength from chat config (default 1600 characters).
 */

import { getChatConfig } from '@/shared/config';

/**
 * Check if a message exceeds the SMS maximum length
 *
 * @param message - The message to check
 * @param maxLength - Optional override for the max length (defaults to config value)
 * @returns true if the message is too long, false otherwise
 */
export function isMessageTooLong(message: string, maxLength?: number): boolean {
  const limit = maxLength ?? getChatConfig().smsMaxLength;
  return message.length > limit;
}

/**
 * Get the configured SMS maximum length
 *
 * @returns The maximum SMS length from config
 */
export function getSmsMaxLength(): number {
  return getChatConfig().smsMaxLength;
}
