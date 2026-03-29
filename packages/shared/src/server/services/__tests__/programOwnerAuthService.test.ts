import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProgramOwnerAuthService } from '../domain/auth/programOwnerAuthService';
import type { ProgramOwnerAuthServiceInstance } from '../domain/auth/programOwnerAuthService';

// Mock config modules
vi.mock('@/server/config', () => ({
  getEnvironmentSettings: vi.fn(() => ({ enableDevBypass: false })),
}));

vi.mock('@/shared/config', () => ({
  getAdminConfig: vi.fn(() => ({ devBypassCode: '000000' })),
}));

function makeOwner(overrides: Record<string, any> = {}) {
  return {
    id: 'owner-1',
    userId: 'user-1',
    displayName: 'Test Owner',
    slug: 'test-owner',
    phone: '+11234567890',
    isActive: true,
    isAi: false,
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    programOwner: {
      findByPhone: vi.fn().mockResolvedValue(makeOwner()),
    },
    userAuth: {
      countRecentRequests: vi.fn().mockResolvedValue(0),
      createAuthCode: vi.fn().mockResolvedValue(undefined),
      findValidCode: vi.fn().mockResolvedValue({ id: 'code-1', phoneNumber: '+11234567890', code: '123456' }),
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

describe('ProgramOwnerAuthService', () => {
  let service: ProgramOwnerAuthServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let twilio: ReturnType<typeof makeMockTwilio>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    twilio = makeMockTwilio();
    service = createProgramOwnerAuthService(repos, { twilioClient: twilio });
  });

  describe('findOwnerByPhone', () => {
    it('should return owner for known phone', async () => {
      const result = await service.findOwnerByPhone('+11234567890');
      expect(result).toEqual(expect.objectContaining({ id: 'owner-1' }));
    });

    it('should return null for unknown phone', async () => {
      repos.programOwner.findByPhone.mockResolvedValueOnce(null);
      const result = await service.findOwnerByPhone('+10000000000');
      expect(result).toBeNull();
    });
  });

  describe('requestCode', () => {
    it('should send verification code successfully', async () => {
      const result = await service.requestCode('+11234567890');
      expect(result.success).toBe(true);
      expect(result.ownerId).toBe('owner-1');
      expect(repos.userAuth.createAuthCode).toHaveBeenCalled();
      expect(twilio.sendSMS).toHaveBeenCalledWith('+11234567890', expect.stringContaining('verification code'));
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.requestCode('+441234567890');
      expect(result.success).toBe(false);
      expect(result.message).toContain('phone number format');
    });

    it('should reject unregistered phone numbers', async () => {
      repos.programOwner.findByPhone.mockResolvedValueOnce(null);
      const result = await service.requestCode('+10000000000');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not registered');
    });

    it('should reject inactive owners', async () => {
      repos.programOwner.findByPhone.mockResolvedValueOnce(makeOwner({ isActive: false }));
      const result = await service.requestCode('+11234567890');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not active');
    });

    it('should enforce rate limiting', async () => {
      repos.userAuth.countRecentRequests.mockResolvedValueOnce(3);
      const result = await service.requestCode('+11234567890');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many requests');
    });

    it('should handle SMS send failure gracefully', async () => {
      twilio.sendSMS.mockRejectedValueOnce(new Error('Twilio down'));
      const result = await service.requestCode('+11234567890');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to send');
    });
  });

  describe('verifyCode', () => {
    it('should verify valid code', async () => {
      const result = await service.verifyCode('+11234567890', '123456');
      expect(result.success).toBe(true);
      expect(result.ownerId).toBe('owner-1');
      expect(repos.userAuth.deleteCodesForPhone).toHaveBeenCalledWith('+11234567890');
    });

    it('should reject non-+1 phone numbers', async () => {
      const result = await service.verifyCode('+441234567890', '123456');
      expect(result.success).toBe(false);
    });

    it('should reject unregistered phone numbers', async () => {
      repos.programOwner.findByPhone.mockResolvedValueOnce(null);
      const result = await service.verifyCode('+10000000000', '123456');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not registered');
    });

    it('should reject inactive owners', async () => {
      repos.programOwner.findByPhone.mockResolvedValueOnce(makeOwner({ isActive: false }));
      const result = await service.verifyCode('+11234567890', '123456');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not active');
    });

    it('should reject invalid code format (too short)', async () => {
      const result = await service.verifyCode('+11234567890', '123');
      expect(result.success).toBe(false);
      expect(result.message).toContain('6 digits');
    });

    it('should reject non-numeric code', async () => {
      const result = await service.verifyCode('+11234567890', 'abcdef');
      expect(result.success).toBe(false);
      expect(result.message).toContain('6 digits');
    });

    it('should reject invalid/expired code', async () => {
      repos.userAuth.findValidCode.mockResolvedValueOnce(null);
      const result = await service.verifyCode('+11234567890', '999999');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid or expired');
    });

    it('should handle DB error gracefully', async () => {
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
