import { getEnvironmentSettings } from '@/server/config';
import { getAdminConfig } from '@/shared/config';
import type { RepositoryContainer } from '../../../repositories/factory';
import type { ITwilioClient } from '@/server/connections/twilio/factory';
import type { ProgramOwner } from '@/server/models/programOwner';

// =============================================================================
// Factory Pattern
// =============================================================================

/**
 * ProgramOwnerAuthServiceInstance interface
 *
 * Defines all public methods available on the program owner auth service.
 * Unlike AdminAuthService which uses a whitelist, this service checks
 * program_owners.phone to authorize login attempts.
 */
export interface ProgramOwnerAuthServiceInstance {
  findOwnerByPhone(phoneNumber: string): Promise<ProgramOwner | null>;
  requestCode(phoneNumber: string): Promise<{ success: boolean; message?: string; ownerId?: string }>;
  verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; ownerId?: string }>;
  cleanupExpiredCodes(): Promise<number>;
}

export interface ProgramOwnerAuthServiceDeps {
  twilioClient: ITwilioClient;
}

/**
 * Create a ProgramOwnerAuthService instance with injected dependencies
 *
 * This service handles phone-based authentication for program owners.
 * Authorization is based on having a record in program_owners with a matching phone number.
 *
 * @param repos - Repository container with all repositories
 * @param deps - External dependencies (twilioClient)
 * @returns ProgramOwnerAuthServiceInstance
 */
export function createProgramOwnerAuthService(
  repos: RepositoryContainer,
  deps: ProgramOwnerAuthServiceDeps
): ProgramOwnerAuthServiceInstance {
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
    async findOwnerByPhone(phoneNumber: string): Promise<ProgramOwner | null> {
      return repos.programOwner.findByPhone(phoneNumber);
    },

    async requestCode(phoneNumber: string): Promise<{ success: boolean; message?: string; ownerId?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[ProgramOwnerAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        // Check if this phone belongs to a program owner
        const owner = await repos.programOwner.findByPhone(phoneNumber);
        if (!owner) {
          console.warn(`[ProgramOwnerAuth] No program owner found for phone: ${phoneNumber}`);
          return { success: false, message: 'Phone number not registered as a program owner.' };
        }

        if (!owner.isActive) {
          console.warn(`[ProgramOwnerAuth] Inactive program owner attempted login: ${phoneNumber}`);
          return { success: false, message: 'This account is not active. Please contact support.' };
        }

        // Rate limiting
        const rateLimitWindow = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
        const recentRequests = await repos.userAuth.countRecentRequests(phoneNumber, rateLimitWindow);

        if (recentRequests >= MAX_REQUESTS_PER_WINDOW) {
          return { success: false, message: `Too many requests. Please try again in ${RATE_LIMIT_WINDOW_MINUTES} minutes.` };
        }

        const code = generateCode();
        const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

        await repos.userAuth.createAuthCode(phoneNumber, code, expiresAt);

        const message = `Your GymText Programs verification code is: ${code}\n\nThis code expires in ${CODE_EXPIRY_MINUTES} minutes.`;
        await deps.twilioClient.sendSMS(phoneNumber, message);

        console.log(`[ProgramOwnerAuth] Verification code sent to ${phoneNumber} (owner: ${owner.displayName})`);

        if (isDev) {
          console.log(`[ProgramOwnerAuth:Dev] Verification code for ${phoneNumber}: ${code}`);
          console.log(`[ProgramOwnerAuth:Dev] Tip: You can also use magic code "${devBypassCode}" in dev mode`);
        }

        return { success: true, ownerId: owner.id };
      } catch (error) {
        console.error('[ProgramOwnerAuth] Error requesting verification code:', error);
        return { success: false, message: 'Failed to send verification code. Please try again.' };
      }
    },

    async verifyCode(phoneNumber: string, code: string): Promise<{ success: boolean; message?: string; ownerId?: string }> {
      try {
        if (!phoneNumber.startsWith('+1')) {
          console.error('[ProgramOwnerAuth] Phone number not properly normalized:', phoneNumber);
          return { success: false, message: 'Internal error: phone number format invalid' };
        }

        // Check if this phone belongs to a program owner
        const owner = await repos.programOwner.findByPhone(phoneNumber);
        if (!owner) {
          console.warn(`[ProgramOwnerAuth] Verification attempt for unregistered phone: ${phoneNumber}`);
          return { success: false, message: 'Phone number not registered as a program owner.' };
        }

        if (!owner.isActive) {
          console.warn(`[ProgramOwnerAuth] Inactive program owner verification attempt: ${phoneNumber}`);
          return { success: false, message: 'This account is not active. Please contact support.' };
        }

        if (code.length !== CODE_LENGTH || !/^\d+$/.test(code)) {
          return { success: false, message: 'Invalid code format. Code must be 6 digits.' };
        }

        // Dev bypass
        if (isDev && code === devBypassCode) {
          console.log(`[ProgramOwnerAuth:Dev] Magic bypass code accepted for ${phoneNumber}`);
          await repos.userAuth.deleteCodesForPhone(phoneNumber);
          return { success: true, ownerId: owner.id };
        }

        const authCode = await repos.userAuth.findValidCode(phoneNumber, code);

        if (!authCode) {
          return { success: false, message: 'Invalid or expired verification code.' };
        }

        await repos.userAuth.deleteCodesForPhone(phoneNumber);
        console.log(`[ProgramOwnerAuth] Program owner verified: ${phoneNumber} (${owner.displayName})`);

        return { success: true, ownerId: owner.id };
      } catch (error) {
        console.error('[ProgramOwnerAuth] Error verifying code:', error);
        return { success: false, message: 'Failed to verify code. Please try again.' };
      }
    },

    async cleanupExpiredCodes(): Promise<number> {
      try {
        const deletedCount = await repos.userAuth.deleteExpiredCodes();
        console.log(`[ProgramOwnerAuth] Cleaned up ${deletedCount} expired auth codes`);
        return deletedCount;
      } catch (error) {
        console.error('[ProgramOwnerAuth] Error cleaning up expired codes:', error);
        return 0;
      }
    },
  };
}
