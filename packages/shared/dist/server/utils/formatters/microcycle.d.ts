/**
 * Microcycle Formatting Utilities
 *
 * Pure functions for formatting microcycle data into string representations
 * for use in prompts, messages, and other contexts.
 */
import type { MicrocyclePattern } from '@/server/models/microcycle';
/**
 * Simple day input with day name and content
 */
interface DayInput {
    day: string;
    content: string;
}
/**
 * Format a microcycle day into a string representation
 *
 * @param day - Day object with name and content
 * @returns Formatted string with day details
 */
export declare function formatMicrocycleDay(day: DayInput): string;
/**
 * Format all days of a microcycle into a summary
 *
 * @param days - Array of 7 day overview strings
 * @returns Formatted multi-line string with all days
 */
export declare function formatMicrocycleDays(days: string[]): string;
/**
 * Format a full microcycle pattern into a readable overview
 *
 * @param pattern - Complete microcycle pattern
 * @returns Formatted overview string
 */
export declare function formatMicrocyclePattern(pattern: MicrocyclePattern): string;
export {};
//# sourceMappingURL=microcycle.d.ts.map