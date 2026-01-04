export declare const COMMON_TIMEZONES: readonly ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome", "Europe/Amsterdam", "Europe/Stockholm", "Europe/Moscow", "Asia/Tokyo", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Singapore", "Asia/Seoul", "Asia/Mumbai", "Asia/Dubai", "Australia/Sydney", "Australia/Melbourne", "Pacific/Auckland"];
export type CommonTimezone = typeof COMMON_TIMEZONES[number];
/**
 * Validates if a string is a valid IANA timezone identifier
 */
export declare function isValidIANATimezone(timezone: string): boolean;
/**
 * Gets the local hour for a given UTC date in a specific timezone
 */
export declare function getLocalHourForTimezone(utcDate: Date, timezone: string): number;
/**
 * Converts a preferred local hour to UTC hour for a given timezone
 * Returns the UTC hour when it's the specified local hour in the given timezone
 */
export declare function convertPreferredHourToUTC(localHour: number, timezone: string): number;
/**
 * Gets all UTC hours when it's the specified local hour in the given timezone
 * This accounts for DST transitions where a local hour might occur at different UTC hours
 */
export declare function getAllUTCHoursForLocalHour(localHour: number, timezone: string): number[];
/**
 * Formats a timezone identifier for display in UI
 * Example: "America/New_York" -> "New York (EST/EDT)"
 */
export declare function formatTimezoneForDisplay(timezone: string): string;
export declare function getCommonTimezones(): readonly string[];
//# sourceMappingURL=timezone.d.ts.map