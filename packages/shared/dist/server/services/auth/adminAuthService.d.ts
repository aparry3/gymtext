/**
 * Service for handling admin authentication via SMS verification codes
 * Admins are verified by phone number whitelist (no user account required)
 */
export declare class AdminAuthService {
    private authRepository;
    private readonly MAX_REQUESTS_PER_WINDOW;
    private readonly RATE_LIMIT_WINDOW_MINUTES;
    private readonly CODE_EXPIRY_MINUTES;
    private readonly CODE_LENGTH;
    private readonly isDev;
    private readonly devBypassCode;
    constructor();
    /**
     * Check if a phone number is in the admin whitelist
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    isPhoneWhitelisted(phoneNumber: string): boolean;
    /**
     * Generate a random 6-digit verification code
     */
    private generateCode;
    /**
     * Request a verification code for admin login
     * Only sends codes to whitelisted phone numbers
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    requestCode(phoneNumber: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Verify a code for admin login
     * Does not require or create a user account
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    verifyCode(phoneNumber: string, code: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Clean up expired auth codes (should be run periodically)
     */
    cleanupExpiredCodes(): Promise<number>;
}
export declare const adminAuthService: AdminAuthService;
//# sourceMappingURL=adminAuthService.d.ts.map