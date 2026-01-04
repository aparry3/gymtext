/**
 * Centralized phone number utilities for US-based phone numbers
 *
 * GymText assumes all users are US-based, so all phone numbers
 * should be normalized to +1XXXXXXXXXX format.
 */
/**
 * Normalizes a phone number input to US E.164 format (+1XXXXXXXXXX)
 *
 * Supported input formats:
 * - 3392223571 → +13392223571 (10 digits, adds +1 prefix)
 * - 13392223571 → +13392223571 (11 digits starting with 1, adds + prefix)
 * - +13392223571 → +13392223571 (already formatted, no change)
 *
 * @param input - Phone number in various formats
 * @returns Normalized phone number or null if invalid
 */
export declare function normalizeUSPhoneNumber(input: string | null | undefined): string | null;
/**
 * Validates that a phone number is a properly formatted US phone number
 *
 * @param phone - Phone number to validate
 * @returns true if valid US phone number, false otherwise
 */
export declare function validateUSPhoneNumber(phone: string | null | undefined): boolean;
/**
 * Checks if a phone number is a US phone number (starts with +1)
 *
 * @param phone - Phone number to check
 * @returns true if starts with +1, false otherwise
 */
export declare function isUSPhoneNumber(phone: string): boolean;
/**
 * Formats a US phone number for display purposes
 * +13392223571 → (339) 222-3571
 *
 * @param phone - Normalized US phone number (+1XXXXXXXXXX)
 * @returns Formatted phone number or original input if invalid
 */
export declare function formatUSPhoneForDisplay(phone: string): string;
/**
 * Type guard for normalized phone numbers
 */
export type NormalizedUSPhone = string & {
    __brand: 'NormalizedUSPhone';
};
/**
 * Creates a branded type for validated US phone numbers
 *
 * @param phone - Phone number to validate and brand
 * @returns Branded phone number if valid, null otherwise
 */
export declare function createNormalizedUSPhone(phone: string): NormalizedUSPhone | null;
//# sourceMappingURL=phoneUtils.d.ts.map