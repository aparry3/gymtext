import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createAdminAuthService } from '../domain/auth/adminAuthService';
import type { AdminAuthServiceInstance } from '../domain/auth/adminAuthService';

// Mock config modules
vi.mock('@/server/config', () => ({
  getEnvironmentSettings: vi.fn(() => ({ enableDevBypass: false })),
}));

vi.mock('@/shared/config', () => ({
  getAdminConfig: vi.fn(() => ({
    phoneNumbers: ['+11234567890', '+10987654321'],
    devBypassCode: '000000',
  })),
}));

function makeMockRepos() {
  return {
    userAuth: {
      countRecentRequests: vi.fn().mockResolvedValue(0),
      createAuthCode: vi.fn().mockResolvedValue(undefined),
      findValidCode: vi.fn().mockResolvedValue({ id: 'code-1', code: '123456' }),
      deleteCodesForPhone: vi.fn().mockResolvedValue(undefined),
      deleteExpiredCodes: vi.fn().mockResolvedValue(3),
    },
  } as any;
}

function makeMockTwilio() {
  return {
    sendSMS: vi.fn().mockResolvedValue(undefined),
  } as any;
}

describe('AdminAuthService', () => {
  let service: AdminAuthServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let twilio: ReturnType<typeof makeMockTwilio>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    twilio = makeMockTwilio();
    service = createAdminAuthService(repos, { twilioClient: twilio });
  });

  describe('isPhoneWhitelisted', () => {
    it('should return true for whitelisted phone numbers', () => {
      expect(service.isPhoneWhitelisted('+11234567890')).toBe(true);
    });

    it('should return false for non-whitelisted phone numbers', () => {
      expect(service.isPhoneWhitelisted('+15555555555')).toBe(false);
    });

    it('should return false when no phone numbers configured', async () => {
      const { getAdminConfig } = await import('@/shared/config');
      // isPhoneWhitelisted calls getAdminConfig on each invocation
      (getAdminConfig as any).mockReturnValueOnce({ phoneNumbers: [], devBypassCode: '000000' });

      expect(service.isPhoneWhitelisted('+11234567890')).toBe(false);
    });
  });

  describe('requestCode', () => {
    it('should send verification code to whitelisted phone', async () => {
      const result = await service.requestCode('+11234567890');

      expect(result.success).toBe(true);
      expect(repos.userAuth.createAuthCode).toHaveBeenCalledWith(
        '+11234567890',
        expect.stringMatching(/^\d{6}$/),
        expect.any(Date)
      );
      expect(twilio.sendSMS).toHaveBeenCalledWith(
        '+11234567890',
        expect.stringContaining('verification code')
      );
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.requestCode('1234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('phone number format');
      expect(twilio.sendSMS).not.toHaveBeenCalled();
    });

    it('should reject non-whitelisted phone numbers', async () => {
      const result = await service.requestCode('+15555555555');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not authorized');
    });

    it('should enforce rate limiting', async () => {
      repos.userAuth.countRecentRequests.mockResolvedValueOnce(3);

      const result = await service.requestCode('+11234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many requests');
      expect(twilio.sendSMS).not.toHaveBeenCalled();
    });

    it('should handle SMS send failure gracefully', async () => {
      twilio.sendSMS.mockRejectedValueOnce(new Error('Twilio error'));

      const result = await service.requestCode('+11234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to send');
    });
  });

  describe('verifyCode', () => {
    it('should verify a valid code', async () => {
      const result = await service.verifyCode('+11234567890', '123456');

      expect(result.success).toBe(true);
      expect(repos.userAuth.findValidCode).toHaveBeenCalledWith('+11234567890', '123456');
      expect(repos.userAuth.deleteCodesForPhone).toHaveBeenCalledWith('+11234567890');
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.verifyCode('1234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('phone number format');
    });

    it('should reject non-whitelisted phone numbers', async () => {
      const result = await service.verifyCode('+15555555555', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not authorized');
    });

    it('should reject invalid code format (too short)', async () => {
      const result = await service.verifyCode('+11234567890', '123');

      expect(result.success).toBe(false);
      expect(result.message).toContain('6 digits');
    });

    it('should reject invalid code format (non-numeric)', async () => {
      const result = await service.verifyCode('+11234567890', 'abcdef');

      expect(result.success).toBe(false);
      expect(result.message).toContain('6 digits');
    });

    it('should reject expired/invalid codes', async () => {
      repos.userAuth.findValidCode.mockResolvedValueOnce(null);

      const result = await service.verifyCode('+11234567890', '999999');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should handle database errors gracefully', async () => {
      repos.userAuth.findValidCode.mockRejectedValueOnce(new Error('DB error'));

      const result = await service.verifyCode('+11234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to verify');
    });
  });

  describe('cleanupExpiredCodes', () => {
    it('should delete expired codes and return count', async () => {
      const count = await service.cleanupExpiredCodes();
      expect(repos.userAuth.deleteExpiredCodes).toHaveBeenCalled();
      expect(count).toBe(3);
    });

    it('should return 0 on error', async () => {
      repos.userAuth.deleteExpiredCodes.mockRejectedValueOnce(new Error('DB error'));
      const count = await service.cleanupExpiredCodes();
      expect(count).toBe(0);
    });
  });
});
