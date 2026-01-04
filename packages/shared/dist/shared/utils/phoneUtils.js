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
export function normalizeUSPhoneNumber(input) {
    if (!input || typeof input !== 'string') {
        return null;
    }
    // Remove all non-numeric characters
    const digits = input.replace(/\D/g, '');
    if (!digits) {
        return null;
    }
    // Handle different input formats
    if (digits.length === 10) {
        // US number without country code: 3392223571
        // Validate that it starts with a valid area code (2-9 for first digit)
        if (digits[0] >= '2' && digits[0] <= '9') {
            return `+1${digits}`;
        }
    }
    else if (digits.length === 11 && digits.startsWith('1')) {
        // US number with country code: 13392223571
        // Validate that area code starts with valid digit (2-9 for 4th digit)
        if (digits[1] >= '2' && digits[1] <= '9') {
            return `+${digits}`;
        }
    }
    else if (input.startsWith('+1') && digits.length === 11 && digits.startsWith('1')) {
        // Already formatted: +13392223571
        // Validate format
        if (digits[1] >= '2' && digits[1] <= '9') {
            return input;
        }
    }
    // Invalid format or length
    return null;
}
/**
 * Validates that a phone number is a properly formatted US phone number
 *
 * @param phone - Phone number to validate
 * @returns true if valid US phone number, false otherwise
 */
export function validateUSPhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return false;
    }
    // Must be in E.164 format for US: +1XXXXXXXXXX
    // Area code (first 3 digits after +1) must start with 2-9
    // Exchange code (next 3 digits) must start with 2-9
    const e164USRegex = /^\+1[2-9]\d{2}[2-9]\d{6}$/;
    return e164USRegex.test(phone);
}
/**
 * Checks if a phone number is a US phone number (starts with +1)
 *
 * @param phone - Phone number to check
 * @returns true if starts with +1, false otherwise
 */
export function isUSPhoneNumber(phone) {
    return typeof phone === 'string' && phone.startsWith('+1');
}
/**
 * Formats a US phone number for display purposes
 * +13392223571 → (339) 222-3571
 *
 * @param phone - Normalized US phone number (+1XXXXXXXXXX)
 * @returns Formatted phone number or original input if invalid
 */
export function formatUSPhoneForDisplay(phone) {
    if (!validateUSPhoneNumber(phone)) {
        return phone;
    }
    // Remove +1 and format as (XXX) XXX-XXXX
    const digits = phone.slice(2); // Remove +1
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
/**
 * Creates a branded type for validated US phone numbers
 *
 * @param phone - Phone number to validate and brand
 * @returns Branded phone number if valid, null otherwise
 */
export function createNormalizedUSPhone(phone) {
    if (validateUSPhoneNumber(phone)) {
        return phone;
    }
    return null;
}
