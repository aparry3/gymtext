/**
 * Client-side timezone utilities
 * These are safe to use in React components
 */
export declare const COMMON_TIMEZONES: readonly ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Stockholm", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Seoul", "Asia/Mumbai", "Asia/Dubai", "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland"];
export type CommonTimezone = typeof COMMON_TIMEZONES[number];
export declare function formatTimezoneForDisplay(timezone: string): string;
/**
 * Validate if a timezone string is a valid IANA timezone identifier
 *
 * @param timezone - Timezone string to validate
 * @returns true if valid IANA timezone, false otherwise
 */
export declare function isValidTimezone(timezone: string | null | undefined): boolean;
/**
 * Get timezone suggestions based on partial input
 *
 * @param input - Partial timezone or location input
 * @returns Array of suggested timezones with display names
 */
export declare function getTimezoneSuggestions(input: string): Array<{
    timezone: string;
    display: string;
}>;
//# sourceMappingURL=timezone.d.ts.map