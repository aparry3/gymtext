import { UserAuthRepository } from '@/server/repositories/userAuthRepository';
import { twilioClient } from '@/server/connections/twilio/twilio';

/**
 * Service for handling admin authentication via SMS verification codes
 * Admins are verified by phone number whitelist (no user account required)
 */
export class AdminAuthService {
  private authRepository: UserAuthRepository;

  // Rate limiting configuration
  private readonly MAX_REQUESTS_PER_WINDOW = 3;
  private readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private readonly CODE_EXPIRY_MINUTES = 10;
  private readonly CODE_LENGTH = 6;

  constructor() {
    this.authRepository = new UserAuthRepository();
  }

  /**
   * Check if a phone number is in the admin whitelist
   */
  isPhoneWhitelisted(phoneNumber: string): boolean {
    const whitelist = process.env.ADMIN_PHONE_NUMBERS;

    if (!whitelist) {
      console.warn('[AdminAuth] ADMIN_PHONE_NUMBERS not configured');
      return false;
    }

    // Parse comma-separated list and normalize phone numbers
    const allowedNumbers = whitelist
      .split(',')
      .map(num => num.trim())
      .filter(num => num.length > 0);

    // Normalize the input phone number (ensure +1 prefix)
    const normalizedPhone = phoneNumber.startsWith('+1')
      ? phoneNumber
      : `+1${phoneNumber}`;

    return allowedNumbers.includes(normalizedPhone);
  }

  /**
   * Generate a random 6-digit verification code
   */
  private generateCode(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Request a verification code for admin login
   * Only sends codes to whitelisted phone numbers
   */
  async requestCode(
    phoneNumber: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Normalize phone number (ensure it has +1 prefix)
      const normalizedPhone = phoneNumber.startsWith('+1')
        ? phoneNumber
        : `+1${phoneNumber}`;

      // Check whitelist FIRST - reject if not authorized
      if (!this.isPhoneWhitelisted(normalizedPhone)) {
        console.warn(`[AdminAuth] Unauthorized admin login attempt: ${normalizedPhone}`);
        return {
          success: false,
          message: 'Phone number not authorized for admin access.',
        };
      }

      // Check rate limiting
      const rateLimitWindow = new Date(
        Date.now() - this.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
      );
      const recentRequests = await this.authRepository.countRecentRequests(
        normalizedPhone,
        rateLimitWindow
      );

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
      await this.authRepository.createAuthCode(normalizedPhone, code, expiresAt);

      // Send SMS with code
      const message = `Your GymText admin verification code is: ${code}\n\nThis code expires in ${this.CODE_EXPIRY_MINUTES} minutes.`;
      await twilioClient.sendSMS(normalizedPhone, message);

      console.log(`[AdminAuth] Verification code sent to ${normalizedPhone}`);

      return {
        success: true,
      };
    } catch (error) {
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
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Normalize phone number
      const normalizedPhone = phoneNumber.startsWith('+1')
        ? phoneNumber
        : `+1${phoneNumber}`;

      // Double-check whitelist (belt and suspenders)
      if (!this.isPhoneWhitelisted(normalizedPhone)) {
        console.warn(`[AdminAuth] Unauthorized verification attempt: ${normalizedPhone}`);
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

      // Find valid code in database
      const authCode = await this.authRepository.findValidCode(
        normalizedPhone,
        code
      );

      if (!authCode) {
        return {
          success: false,
          message: 'Invalid or expired verification code.',
        };
      }

      // Delete all codes for this phone number (cleanup)
      await this.authRepository.deleteCodesForPhone(normalizedPhone);

      console.log(`[AdminAuth] Admin verified: ${normalizedPhone}`);

      return {
        success: true,
      };
    } catch (error) {
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
  async cleanupExpiredCodes(): Promise<number> {
    try {
      const deletedCount = await this.authRepository.deleteExpiredCodes();
      console.log(`[AdminAuth] Cleaned up ${deletedCount} expired auth codes`);
      return deletedCount;
    } catch (error) {
      console.error('[AdminAuth] Error cleaning up expired codes:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const adminAuthService = new AdminAuthService();
