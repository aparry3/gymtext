import { UserAuthRepository } from '@/server/repositories/userAuthRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import { twilioClient } from '@/server/connections/twilio/twilio';
import { encryptUserId } from '@/server/utils/sessionCrypto';

/**
 * Service for handling user authentication via SMS verification codes
 */
export class UserAuthService {
  private authRepository: UserAuthRepository;
  private userRepository: UserRepository;

  // Rate limiting configuration
  private readonly MAX_REQUESTS_PER_WINDOW = 3;
  private readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private readonly CODE_EXPIRY_MINUTES = 10;
  private readonly CODE_LENGTH = 6;

  constructor() {
    this.authRepository = new UserAuthRepository();
    this.userRepository = new UserRepository();
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
   * Request a verification code to be sent to a phone number
   * Returns success status and optional error message
   */
  async requestVerificationCode(
    phoneNumber: string
  ): Promise<{ success: boolean; message?: string; userId?: string }> {
    try {
      // Normalize phone number (ensure it has +1 prefix)
      const normalizedPhone = phoneNumber.startsWith('+1')
        ? phoneNumber
        : `+1${phoneNumber}`;

      // Check if user exists with this phone number
      const user = await this.userRepository.findByPhoneNumber(normalizedPhone);

      if (!user) {
        return {
          success: false,
          message: 'Phone number not registered. Please sign up first.',
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
      const message = `Your GymText verification code is: ${code}\n\nThis code expires in ${this.CODE_EXPIRY_MINUTES} minutes.`;
      await twilioClient.sendSMS(normalizedPhone, message);

      return {
        success: true,
        userId: user.id,
      };
    } catch (error) {
      console.error('Error requesting verification code:', error);
      return {
        success: false,
        message: 'Failed to send verification code. Please try again.',
      };
    }
  }

  /**
   * Verify a code and return the user ID if valid
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; message?: string; userId?: string }> {
    try {
      // Normalize phone number
      const normalizedPhone = phoneNumber.startsWith('+1')
        ? phoneNumber
        : `+1${phoneNumber}`;

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

      // Get user by phone number
      const user = await this.userRepository.findByPhoneNumber(normalizedPhone);

      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      // Delete all codes for this phone number (cleanup)
      await this.authRepository.deleteCodesForPhone(normalizedPhone);

      return {
        success: true,
        userId: user.id,
      };
    } catch (error) {
      console.error('Error verifying code:', error);
      return {
        success: false,
        message: 'Failed to verify code. Please try again.',
      };
    }
  }

  /**
   * Create an encrypted session token for a user ID
   */
  createSessionToken(userId: string): string {
    return encryptUserId(userId);
  }

  /**
   * Clean up expired auth codes (should be run periodically)
   */
  async cleanupExpiredCodes(): Promise<number> {
    try {
      const deletedCount = await this.authRepository.deleteExpiredCodes();
      console.log(`Cleaned up ${deletedCount} expired auth codes`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired codes:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const userAuthService = new UserAuthService();
