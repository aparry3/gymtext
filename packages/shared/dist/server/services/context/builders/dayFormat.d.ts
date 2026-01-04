/**
 * Day Format Context Builder
 *
 * Provides formatting rules for different day types (TRAINING, ACTIVE_RECOVERY, REST).
 * Format templates are stored in the prompts table and fetched dynamically.
 */
export type DayActivityType = 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST';
/**
 * Fetch day format prompt from database
 *
 * @param activityType - The type of day (TRAINING, ACTIVE_RECOVERY, REST)
 * @returns The format template string or null if not found
 */
export declare const fetchDayFormat: (activityType: DayActivityType | null | undefined) => Promise<string | null>;
/**
 * Build day format context string
 *
 * @param formatTemplate - The pre-fetched format template
 * @param activityType - The type of day (for labeling)
 * @returns Formatted context string with XML tags
 */
export declare const buildDayFormatContext: (formatTemplate: string | null | undefined, activityType: DayActivityType | null | undefined) => string;
//# sourceMappingURL=dayFormat.d.ts.map