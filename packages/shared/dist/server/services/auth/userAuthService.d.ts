/**
 * Service for handling user authentication via SMS verification codes
 */
export declare class UserAuthService {
    private authRepository;
    private userRepository;
    private readonly MAX_REQUESTS_PER_WINDOW;
    private readonly RATE_LIMIT_WINDOW_MINUTES;
    private readonly CODE_EXPIRY_MINUTES;
    private readonly CODE_LENGTH;
    private readonly isDev;
    private readonly devBypassCode;
    constructor();
    /**
     * Generate a random 6-digit verification code
     */
    private generateCode;
    /**
     * Request a verification code to be sent to a phone number
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     * Returns success status and optional error message
     */
    requestVerificationCode(phoneNumber: string): Promise<{
        success: boolean;
        message?: string;
        userId?: string;
    }>;
    /**
     * Verify a code and return the user ID if valid
     * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
     */
    verifyCode(phoneNumber: string, code: string): Promise<{
        success: boolean;
        message?: string;
        userId?: string;
    }>;
    /**
     * Create an encrypted session token for a user ID
     */
    createSessionToken(userId: string): string;
    /**
     * Clean up expired auth codes (should be run periodically)
     */
    cleanupExpiredCodes(): Promise<number>;
}
export declare const userAuthService: UserAuthService;
//# sourceMappingURL=userAuthService.d.ts.map