/**
 * Text Formatting Utilities
 *
 * Utilities for formatting and normalizing text content.
 */

/**
 * Normalizes whitespace in text by:
 * - Replacing 2+ consecutive blank lines with a single blank line
 * - Trimming leading/trailing whitespace
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2 (one blank line)
    .trim();
}
