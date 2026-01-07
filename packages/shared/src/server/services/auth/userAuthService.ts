import { encryptUserId } from '@/server/utils/sessionCrypto';
import { getEnvironmentSettings } from '@/server/config';
import { getAdminConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../repositories/factory';
import type { ITwilioClient } from '@/server/connections/twilio/factory';
import type { AdminAuthServiceInstance } from './adminAuthService';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * UserAuthServiceInstance interface
 *
 * Defines all public methods available on the user auth service.
 */
export interface UserAuthServiceInstance {
  requestVerificationCode(phoneNumber: string): Promise<{ success: boolean; message?: string; userId?: string }>;
  verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; userId?: string }>;
  createSessionToken(userId: string): string;
  cleanupExpiredCodes(): Promise<number>;
}

export interface UserAuthServiceDeps {
  twilioClient: ITwilioClient;
  adminAuth: AdminAuthServiceInstance;
}

/**
 * Create a UserAuthService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @param deps - External dependencies (twilioClient, adminAuth)
 * @returns UserAuthServiceInstance
 */
export function createUserAuthService(
  repos: RepositoryContainer,
  deps: UserAuthServiceDeps
): UserAuthServiceInstance {
  const MAX_REQUESTS_PER_WINDOW = 3;
  const RATE_LIMIT_WINDOW_MINUTES = 15;
  const CODE_EXPIRY_MINUTES = 10;
  const CODE_LENGTH = 6;
  const isDev = !getEnvironmentSettings().isProduction;
  const devBypassCode = getAdminConfig().devBypassCode || '000000';

  const generateCode = (): string => {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  };

  return {
    async requestVerificationCode(
      phoneNumber: string
    ): Promise<{ success: boolean; message?: string; userId?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[UserAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        const user = await repos.user.findByPhoneNumber(phoneNumber);
        const isAdmin = deps.adminAuth.isPhoneWhitelisted(phoneNumber);

        if (!user && !isAdmin) {
          return { success: false, message: 'Phone number not registered. Please sign up first.' };
        }

        const rateLimitWindow = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
        const recentRequests = await repos.userAuth.countRecentRequests(phoneNumber, rateLimitWindow);

        if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
          return { success: false, message: `Too many requests. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes.` };
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

        await repos.userAuth.createAuthCode(phoneNumber, code, expiresAt);

        const message = `Your GymText verification code is: ${code}\n\nThis code expires in ${CODE_EXPIRY_MINUTES} minutes.`;
        await deps.twilioClient.sendSMS(phoneNumber, message);

        if (isDev) {
          console.log(`[UserAuth:Dev] 🔑 Verification code for ${phoneNumber}: ${code}`);
          console.log(`[UserAuth:Dev] 💡 Tip: You can also use magic code "${devBypassCode}" in dev mode`);
        }

        return { success: true, userId: user?.id };
      } catch (error) {
        console.error('Error requesting verification code:', error);
        return { success: false, message: 'Failed to send verification code. Please try again.' };
      }
    },

    async verifyCode(
      phoneNumber: string,
      code: string
    ): Promise<{ success: boolean; message?: string; userId?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[UserAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        if (code.length !== CODE_LENGTH || !/^\d+$/.test(code)) {
          return { success: false, message: 'Invalid code format. Code must be 6 digits.' };
        }

        if (isDev && code === devBypassCode) {
          console.log(`[UserAuth:Dev] ✅ Magic bypass code accepted for ${phoneNumber}`);
          const user = await repos.user.findByPhoneNumber(phoneNumber);
          await repos.userAuth.deleteCodesForPhone(phoneNumber);
          return { success: true, userId: user?.id };
        }

        const authCode = await repos.userAuth.findValidCode(phoneNumber, code);

        if (!authCode) {
          return { success: false, message: 'Invalid or expired verification code.' };
        }

        const user = await repos.user.findByPhoneNumber(phoneNumber);

        if (!user) {
          return { success: false, message: 'User not found.' };
        }

        await repos.userAuth.deleteCodesForPhone(phoneNumber);

        return { success: true, userId: user.id };
      } catch (error) {
        console.error('Error verifying code:', error);
        return { success: false, message: 'Failed to verify code. Please try again.' };
      }
    },

    createSessionToken(userId: string): string {
      return encryptUserId(userId);
    },

    async cleanupExpiredCodes(): Promise<number> {
      try {
        const deletedCount = await repos.userAuth.deleteExpiredCodes();
        console.log(`Cleaned up ${deletedCount} expired auth codes`);
        return deletedCount;
      } catch (error) {
        console.error('Error cleaning up expired codes:', error);
        return 0;
      }
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { UserAuthRepository } from '@/server/repositories/userAuthRepository';
import { UserRepository } from '@/server/repositories/userRepository';
import { twilioClient } from '@/server/connections/twilio/twilio';
import { adminAuthService } from './adminAuthService';

/**
 * @deprecated Use createUserAuthService(repos, deps) instead
 */
export class UserAuthService {
  private authRepository: UserAuthRepository;
  private userRepository: UserRepository;

  private readonly MAX_REQUESTS_PER_WINDOW = 3;
  private readonly RATE_LIMIT_WINDOW_MINUTES = 15;
  private readonly CODE_EXPIRY_MINUTES = 10;
  private readonly CODE_LENGTH = 6;

  private readonly isDev = !getEnvironmentSettings().isProduction;
  private readonly devBypassCode = getAdminConfig().devBypassCode || '000000';

  constructor() {
    this.authRepository = new UserAuthRepository();
    this.userRepository = new UserRepository();
  }

  private generateCode(): string {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  async requestVerificationCode(
    phoneNumber: string
  ): Promise<{ success: boolean; message?: string; userId?: string }> {
    try {
      // Phone number should already be normalized by API route
      // Defensive check: ensure it's in E.164 format
      if (!phoneNumber.startsWith('+1')) {
        console.error('[UserAuth] Phone number not properly normalized:', phoneNumber);
        return {
          success: false,
          message: 'Internal error: phone number format invalid',
        };
      }

      // Check if user exists with this phone number OR if it's an admin phone
      const user = await this.userRepository.findByPhoneNumber(phoneNumber);
      const isAdmin = adminAuthService.isPhoneWhitelisted(phoneNumber);

      if (!user && !isAdmin) {
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
        phoneNumber,
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
      await this.authRepository.createAuthCode(phoneNumber, code, expiresAt);

      // Send SMS with code
      const message = `Your GymText verification code is: ${code}\n\nThis code expires in ${this.CODE_EXPIRY_MINUTES} minutes.`;
      await twilioClient.sendSMS(phoneNumber, message);

      // In dev mode, log the code to console for easy testing
      if (this.isDev) {
        console.log(`[UserAuth:Dev] 🔑 Verification code for ${phoneNumber}: ${code}`);
        console.log(`[UserAuth:Dev] 💡 Tip: You can also use magic code "${this.devBypassCode}" in dev mode`);
      }

      return {
        success: true,
        userId: user?.id, // May be undefined for admin-only phones
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
   * Expects phone number to already be normalized to E.164 format (+1XXXXXXXXXX)
   */
  async verifyCode(
    phoneNumber: string,
    code: string
  ): Promise<{ success: boolean; message?: string; userId?: string }> {
    try {
      // Phone number should already be normalized by API route
      // Defensive check: ensure it's in E.164 format
      if (!phoneNumber.startsWith('+1')) {
        console.error('[UserAuth] Phone number not properly normalized:', phoneNumber);
        return {
          success: false,
          message: 'Internal error: phone number format invalid',
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
        console.log(`[UserAuth:Dev] ✅ Magic bypass code accepted for ${phoneNumber}`);

        // Get user by phone number (or return success for admin phones)
        const user = await this.userRepository.findByPhoneNumber(phoneNumber);

        // Clean up any existing codes for this phone
        await this.authRepository.deleteCodesForPhone(phoneNumber);

        return {
          success: true,
          userId: user?.id, // May be undefined for admin-only phones
        };
      }

      // NORMAL FLOW: Find valid code in database
      const authCode = await this.authRepository.findValidCode(
        phoneNumber,
        code
      );

      if (!authCode) {
        return {
          success: false,
          message: 'Invalid or expired verification code.',
        };
      }

      // Get user by phone number
      const user = await this.userRepository.findByPhoneNumber(phoneNumber);

      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      // Delete all codes for this phone number (cleanup)
      await this.authRepository.deleteCodesForPhone(phoneNumber);

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
