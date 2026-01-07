import { getEnvironmentSettings } from '@/server/config';
import { getAdminConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../repositories/factory';
import type { ITwilioClient } from '@/server/connections/twilio/factory';

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * AdminAuthServiceInstance interface
 *
 * Defines all public methods available on the admin auth service.
 */
export interface AdminAuthServiceInstance {
  isPhoneWhitelisted(phoneNumber: string): boolean;
  requestCode(phoneNumber: string): Promise<{ success: boolean; message?: string }>;
  verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }>;
  cleanupExpiredCodes(): Promise<number>;
}

export interface AdminAuthServiceDeps {
  twilioClient: ITwilioClient;
}

/**
 * Create an AdminAuthService instance with injected dependencies
 *
 * @param repos - Repository container with all repositories
 * @param deps - External dependencies (twilioClient)
 * @returns AdminAuthServiceInstance
 */
export function createAdminAuthService(
  repos: RepositoryContainer,
  deps: AdminAuthServiceDeps
): AdminAuthServiceInstance {
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
    isPhoneWhitelisted(phoneNumber: string): boolean {
      const { phoneNumbers } = getAdminConfig();

      if (phoneNumbers.length === 0) {
        console.warn('[AdminAuth] ADMIN_PHONE_NUMBERS not configured');
        return false;
      }

      return phoneNumbers.includes(phoneNumber);
    },

    async requestCode(phoneNumber: string): Promise<{ success: boolean; message?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[AdminAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        if (!this.isPhoneWhitelisted(phoneNumber)) {
          console.warn(`[AdminAuth] Unauthorized admin login attempt: ${phoneNumber}`);
          return { success: false, message: 'Phone number not authorized for admin access.' };
        }

        const rateLimitWindow = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
        const recentRequests = await repos.userAuth.countRecentRequests(phoneNumber, rateLimitWindow);

        if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
          return { success: false, message: `Too many requests. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes.` };
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

        await repos.userAuth.createAuthCode(phoneNumber, code, expiresAt);

        const message = `Your GymText admin verification code is: ${code}\n\nThis code expires in ${CODE_EXPIRY_MINUTES} minutes.`;
        await deps.twilioClient.sendSMS(phoneNumber, message);

        console.log(`[AdminAuth] Verification code sent to ${phoneNumber}`);

        if (isDev) {
          console.log(`[AdminAuth:Dev] 🔑 Verification code for ${phoneNumber}: ${code}`);
          console.log(`[AdminAuth:Dev] 💡 Tip: You can also use magic code "${devBypassCode}" in dev mode`);
        }

        return { success: true };
      } catch (error) {
        console.error('[AdminAuth] Error requesting verification code:', error);
        return { success: false, message: 'Failed to send verification code. Please try again.' };
      }
    },

    async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[AdminAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        if (!this.isPhoneWhitelisted(phoneNumber)) {
          console.warn(`[AdminAuth] Unauthorized verification attempt: ${phoneNumber}`);
          return { success: false, message: 'Phone number not authorized for admin access.' };
        }

        if (code.length !== CODE_LENGTH || !/^\d+$/.test(code)) {
          return { success: false, message: 'Invalid code format. Code must be 6 digits.' };
        }

        if (isDev && code === devBypassCode) {
          console.log(`[AdminAuth:Dev] ✅ Magic bypass code accepted for ${phoneNumber}`);
          await repos.userAuth.deleteCodesForPhone(phoneNumber);
          return { success: true };
        }

        const authCode = await repos.userAuth.findValidCode(phoneNumber, code);

        if (!authCode) {
          return { success: false, message: 'Invalid or expired verification code.' };
        }

        await repos.userAuth.deleteCodesForPhone(phoneNumber);
        console.log(`[AdminAuth] Admin verified: ${phoneNumber}`);

        return { success: true };
      } catch (error) {
        console.error('[AdminAuth] Error verifying code:', error);
        return { success: false, message: 'Failed to verify code. Please try again.' };
      }
    },

    async cleanupExpiredCodes(): Promise<number> {
      try {
        const deletedCount = await repos.userAuth.deleteExpiredCodes();
        console.log(`[AdminAuth] Cleaned up ${deletedCount} expired auth codes`);
        return deletedCount;
      } catch (error) {
        console.error('[AdminAuth] Error cleaning up expired codes:', error);
        return 0;
      }
    },
  };
}

