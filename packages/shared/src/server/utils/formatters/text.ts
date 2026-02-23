/**
 * Text Formatting Utilities
 *
 * Utilities for formatting and normalizing text content.
 */

/**
 * Normalizes whitespace in text by:
 * - Removing trailing whitespace from each line
 * - Replacing 2+ consecutive blank lines with a single blank line
 * - Trimming leading/trailing whitespace
 *
 * @param text - The text to normalize
 * @returns The normalized text
 */
export function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Strips leading/trailing code fences (``` or ```text) from text.
 * Defensive measure for LLM output that may include markdown code blocks.
 */
export function stripCodeFences(text: string): string {
  return text
    .replace(/^```\w*\n?/, '')
    .replace(/\n?```\s*$/, '')
    .trim();
}
