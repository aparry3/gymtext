import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserAuthService } from '../domain/auth/userAuthService';
import type { UserAuthServiceInstance } from '../domain/auth/userAuthService';

// Mock config and crypto modules
vi.mock('@/server/config', () => ({
  getEnvironmentSettings: vi.fn(() => ({ enableDevBypass: false })),
}));

vi.mock('@/shared/config', () => ({
  getAdminConfig: vi.fn(() => ({
    phoneNumbers: ['+10987654321'],
    devBypassCode: '000000',
  })),
}));

vi.mock('@/server/utils/sessionCrypto', () => ({
  encryptUserId: vi.fn((id: string) => `encrypted_${id}`),
}));

function makeMockRepos() {
  return {
    user: {
      findByPhoneNumber: vi.fn().mockResolvedValue({ id: 'user-1', phoneNumber: '+11234567890' }),
    },
    userAuth: {
      countRecentRequests: vi.fn().mockResolvedValue(0),
      createAuthCode: vi.fn().mockResolvedValue(undefined),
      findValidCode: vi.fn().mockResolvedValue({ id: 'code-1', code: '123456' }),
      deleteCodesForPhone: vi.fn().mockResolvedValue(undefined),
      deleteExpiredCodes: vi.fn().mockResolvedValue(2),
    },
  } as any;
}

function makeMockTwilio() {
  return {
    sendSMS: vi.fn().mockResolvedValue(undefined),
  } as any;
}

function makeMockAdminAuth() {
  return {
    isPhoneWhitelisted: vi.fn().mockReturnValue(false),
  } as any;
}

describe('UserAuthService', () => {
  let service: UserAuthServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let twilio: ReturnType<typeof makeMockTwilio>;
  let adminAuth: ReturnType<typeof makeMockAdminAuth>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    twilio = makeMockTwilio();
    adminAuth = makeMockAdminAuth();
    service = createUserAuthService(repos, { twilioClient: twilio, adminAuth });
  });

  describe('requestVerificationCode', () => {
    it('should send code to registered user', async () => {
      const result = await service.requestVerificationCode('+11234567890');

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-1');
      expect(repos.userAuth.createAuthCode).toHaveBeenCalled();
      expect(twilio.sendSMS).toHaveBeenCalledWith(
        '+11234567890',
        expect.stringContaining('verification code')
      );
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.requestVerificationCode('1234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('phone number format');
    });

    it('should reject unregistered non-admin phone numbers', async () => {
      repos.user.findByPhoneNumber.mockResolvedValueOnce(null);

      const result = await service.requestVerificationCode('+15555555555');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not registered');
    });

    it('should allow admin phone even if not a user', async () => {
      repos.user.findByPhoneNumber.mockResolvedValueOnce(null);
      adminAuth.isPhoneWhitelisted.mockReturnValueOnce(true);

      const result = await service.requestVerificationCode('+10987654321');

      expect(result.success).toBe(true);
      expect(result.userId).toBeUndefined(); // no user record
    });

    it('should enforce rate limiting', async () => {
      repos.userAuth.countRecentRequests.mockResolvedValueOnce(3);

      const result = await service.requestVerificationCode('+11234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many requests');
    });

    it('should handle SMS failure gracefully', async () => {
      twilio.sendSMS.mockRejectedValueOnce(new Error('Twilio down'));

      const result = await service.requestVerificationCode('+11234567890');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to send');
    });
  });

  describe('verifyCode', () => {
    it('should verify valid code and return userId', async () => {
      const result = await service.verifyCode('+11234567890', '123456');

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user-1');
      expect(repos.userAuth.deleteCodesForPhone).toHaveBeenCalledWith('+11234567890');
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.verifyCode('1234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('phone number format');
    });

    it('should reject invalid code format', async () => {
      const result = await service.verifyCode('+11234567890', 'abc');

      expect(result.success).toBe(false);
      expect(result.message).toContain('6 digits');
    });

    it('should reject expired/invalid codes', async () => {
      repos.userAuth.findValidCode.mockResolvedValueOnce(null);

      const result = await service.verifyCode('+11234567890', '999999');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should return failure if user not found after code validation', async () => {
      repos.user.findByPhoneNumber.mockResolvedValueOnce(null);

      const result = await service.verifyCode('+11234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('User not found');
    });

    it('should handle database errors gracefully', async () => {
      repos.userAuth.findValidCode.mockRejectedValueOnce(new Error('DB error'));

      const result = await service.verifyCode('+11234567890', '123456');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to verify');
    });
  });

  describe('createSessionToken', () => {
    it('should encrypt userId into token', () => {
      const token = service.createSessionToken('user-1');
      expect(token).toBe('encrypted_user-1');
    });
  });

  describe('cleanupExpiredCodes', () => {
    it('should delete expired codes and return count', async () => {
      const count = await service.cleanupExpiredCodes();
      expect(repos.userAuth.deleteExpiredCodes).toHaveBeenCalled();
      expect(count).toBe(2);
    });

    it('should return 0 on error', async () => {
      repos.userAuth.deleteExpiredCodes.mockRejectedValueOnce(new Error('DB error'));
      const count = await service.cleanupExpiredCodes();
      expect(count).toBe(0);
    });
  });
});
