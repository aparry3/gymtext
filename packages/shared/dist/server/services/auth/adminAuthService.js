import { UserAuthRepository } from '@/server/repositories/userAuthRepository';
import { twilioClient } from '@/server/connections/twilio/twilio';
import { getEnvironmentSettings } from '@/server/config';
import { getAdminConfig } from '@/shared/config';
/**
 * Service for handling admin authentication via SMS verification codes
 * Admins are verified by phone number whitelist (no user account required)
 */
export class AdminAuthService {
    authRepository;
    // Rate limiting configuration
    MAX_REQUESTS_PER_WINDOW = 3;
    RATE_LIMIT_WINDOW_MINUTES = 15;
    CODE_EXPIRY_MINUTES = 10;
    CODE_LENGTH = 6;
    // Dev mode detection
    isDev = !getEnvironmentSettings().isProduction;
    devBypassCode = getAdminConfig().devBypassCode || '000000';
    constructor() {
        this.authRepository = new UserAuthRepository();
    }
    /**
     * Check if a phone number is in the admin whitelist
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    isPhoneWhitelisted(phoneNumber) {
        const { phoneNumbers } = getAdminConfig();
        if (phoneNumbers.length === 0) {
            console.warn('[AdminAuth] ADMIN_PHONE_NUMBERS not configured');
            return false;
        }
        // Phone number should already be normalized - just check whitelist
        return phoneNumbers.includes(phoneNumber);
    }
    /**
     * Generate a random 6-digit verification code
     */
    generateCode() {
        const min = 100000;
        const max = 999999;
        return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }
    /**
     * Request a verification code for admin login
     * Only sends codes to whitelisted phone numbers
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    async requestCode(phoneNumber) {
        try {
            // Phone number should already be normalized by API route
            // Defensive check: ensure it's in E.164 format
            if (!phoneNumber.startsWith('+1')) {
                console.error('[AdminAuth] Phone number not properly normalized:', phoneNumber);
                return {
                    success: false,
                    message: 'Internal error: phone number format invalid',
                };
            }
            // Check whitelist FIRST - reject if not authorized
            if (!this.isPhoneWhitelisted(phoneNumber)) {
                console.warn(`[AdminAuth] Unauthorized admin login attempt: ${phoneNumber}`);
                return {
                    success: false,
                    message: 'Phone number not authorized for admin access.',
                };
            }
            // Check rate limiting
            const rateLimitWindow = new Date(Date.now() - this.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
            const recentRequests = await this.authRepository.countRecentRequests(phoneNumber, rateLimitWindow);
            if (recentRequests >= this.MAX_REQUESTS_PER_WINDOW) {
                return {
                    success: false,
                    message: `Too many requests. Please try again in ${this.RATE_LIMIT_WINDOW_MINUTES} minutes.`,
                };
            }
            // Generate verification code
            const code = this.generateCode();
            const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);
            // Store code in database
            await this.authRepository.createAuthCode(phoneNumber, code, expiresAt);
            // Send SMS with code
            const message = `Your GymText admin verification code is: ${code}\n\nThis code expires in ${this.CODE_EXPIRY_MINUTES} minutes.`;
            await twilioClient.sendSMS(phoneNumber, message);
            console.log(`[AdminAuth] Verification code sent to ${phoneNumber}`);
            // In dev mode, log the code to console for easy testing
            if (this.isDev) {
                console.log(`[AdminAuth:Dev] 🔑 Verification code for ${phoneNumber}: ${code}`);
                console.log(`[AdminAuth:Dev] 💡 Tip: You can also use magic code "${this.devBypassCode}" in dev mode`);
            }
            return {
                success: true,
            };
        }
        catch (error) {
            console.error('[AdminAuth] Error requesting verification code:', error);
            return {
                success: false,
                message: 'Failed to send verification code. Please try again.',
            };
        }
    }
    /**
     * Verify a code for admin login
     * Does not require or create a user account
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    async verifyCode(phoneNumber, code) {
        try {
            // Phone number should already be normalized by API route
            // Defensive check: ensure it's in E.164 format
            if (!phoneNumber.startsWith('+1')) {
                console.error('[AdminAuth] Phone number not properly normalized:', phoneNumber);
                return {
                    success: false,
                    message: 'Internal error: phone number format invalid',
                };
            }
            // Double-check whitelist (belt and suspenders)
            if (!this.isPhoneWhitelisted(phoneNumber)) {
                console.warn(`[AdminAuth] Unauthorized verification attempt: ${phoneNumber}`);
                return {
                    success: false,
                    message: 'Phone number not authorized for admin access.',
                };
            }
            // Validate code format
            if (code.length !== this.CODE_LENGTH || !/^\d+$/.test(code)) {
                return {
                    success: false,
                    message: 'Invalid code format. Code must be 6 digits.',
                };
            }
            // DEV MODE: Accept magic bypass code
            if (this.isDev && code === this.devBypassCode) {
                console.log(`[AdminAuth:Dev] ✅ Magic bypass code accepted for ${phoneNumber}`);
                // Clean up any existing codes for this phone
                await this.authRepository.deleteCodesForPhone(phoneNumber);
                return {
                    success: true,
                };
            }
            // NORMAL FLOW: Find valid code in database
            const authCode = await this.authRepository.findValidCode(phoneNumber, code);
            if (!authCode) {
                return {
                    success: false,
                    message: 'Invalid or expired verification code.',
                };
            }
            // Delete all codes for this phone number (cleanup)
            await this.authRepository.deleteCodesForPhone(phoneNumber);
            console.log(`[AdminAuth] Admin verified: ${phoneNumber}`);
            return {
                success: true,
            };
        }
        catch (error) {
            console.error('[AdminAuth] Error verifying code:', error);
            return {
                success: false,
                message: 'Failed to verify code. Please try again.',
            };
        }
    }
    /**
     * Clean up expired auth codes (should be run periodically)
     */
    async cleanupExpiredCodes() {
        try {
            const deletedCount = await this.authRepository.deleteExpiredCodes();
            console.log(`[AdminAuth] Cleaned up ${deletedCount} expired auth codes`);
            return deletedCount;
        }
        catch (error) {
            console.error('[AdminAuth] Error cleaning up expired codes:', error);
            return 0;
        }
    }
}
// Export singleton instance
export const adminAuthService = new AdminAuthService();
