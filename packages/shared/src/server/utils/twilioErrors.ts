/**
 * Twilio Error Utilities
 *
 * Consolidated helper functions for handling Twilio error codes.
 * These utilities determine which errors are retryable vs terminal.
 */

/**
 * Non-retryable Twilio error codes and patterns.
 * These errors are deterministic - retrying will not help.
 */
const NON_RETRYABLE_ERROR_CODES = [
  '21617', // Message body too long
  '21602', // Message body required
  '21610', // User unsubscribed (STOP received)
  '30004', // Message blocked
  '30005', // Unknown destination
  '30006', // Landline or unreachable carrier
  '30007', // Carrier violation
  '30008', // Unknown error from carrier
];

/**
 * Patterns that indicate non-retryable errors in error messages
 */
const NON_RETRYABLE_PATTERNS = [
  /message.*too long/i,
  /body.*exceeds/i,
  /unsubscribed/i,
  /blacklisted/i,
];

/**
 * Check if an error string indicates a non-retryable error.
 * Non-retryable errors are deterministic failures where retrying will not help.
 *
 * @param error - The error message or code string
 * @returns true if the error is non-retryable
 */
export function isNonRetryableError(error: string | undefined | null): boolean {
  if (!error) return false;

  // Check for known error codes
  for (const code of NON_RETRYABLE_ERROR_CODES) {
    if (error.includes(code)) {
      return true;
    }
  }

  // Check for error message patterns
  for (const pattern of NON_RETRYABLE_PATTERNS) {
    if (pattern.test(error)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an error indicates the user has unsubscribed (error code 21610).
 * This is specifically when the user has texted STOP and opted out.
 *
 * @param error - The error message or code string
 * @returns true if the error indicates the user unsubscribed
 */
export function isUnsubscribedError(error: string | undefined | null): boolean {
  if (!error) return false;
  return error.includes('21610') || /unsubscribed/i.test(error);
}

/**
 * Check if an error indicates the message was blocked.
 *
 * @param error - The error message or code string
 * @returns true if the error indicates the message was blocked
 */
export function isBlockedError(error: string | undefined | null): boolean {
  if (!error) return false;
  return (
    error.includes('30004') ||
    error.includes('30007') ||
    /blocked/i.test(error) ||
    /blacklisted/i.test(error)
  );
}

/**
 * Check if an error indicates an invalid destination.
 *
 * @param error - The error message or code string
 * @returns true if the error indicates an invalid destination
 */
export function isInvalidDestinationError(error: string | undefined | null): boolean {
  if (!error) return false;
  return (
    error.includes('30005') ||
    error.includes('30006') ||
    /unknown destination/i.test(error) ||
    /landline/i.test(error)
  );
}

/**
 * Extract Twilio error code from an error message if present.
 *
 * @param error - The error message or code string
 * @returns The error code if found, undefined otherwise
 */
export function extractTwilioErrorCode(error: string | undefined | null): string | undefined {
  if (!error) return undefined;

  // Match 5-digit Twilio error codes (21xxx or 30xxx patterns)
  const match = error.match(/\b(21\d{3}|30\d{3})\b/);
  return match ? match[1] : undefined;
}
