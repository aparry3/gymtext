import { encryptUserId } from '@/server/utils/sessionCrypto';
import { getEnvironmentSettings } from '@/server/config';
import { getAdminConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../../repositories/factory';
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
  const isDev = getEnvironmentSettings().enableDevBypass;
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

