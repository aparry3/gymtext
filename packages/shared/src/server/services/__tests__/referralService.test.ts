import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createReferralService } from '../domain/referral/referralService';
import type { ReferralServiceInstance } from '../domain/referral/referralService';

vi.mock('@/shared/config', () => ({
  getUrlsConfig: vi.fn(() => ({
    publicBaseUrl: 'https://gymtext.com',
    baseUrl: 'https://gymtext.com',
  })),
}));

vi.mock('@/server/models/referral', () => ({
  MAX_REFERRAL_CREDITS: 12,
  REFERRAL_CREDIT_AMOUNT_CENTS: 1999,
}));

function makeMockRepos() {
  return {
    user: {
      getOrCreateReferralCode: vi.fn().mockResolvedValue('ABC123'),
      findByReferralCode: vi.fn().mockResolvedValue({
        id: 'referrer-1',
        name: 'Jane',
        phoneNumber: '+11234567890',
        stripeCustomerId: 'cus_abc',
      }),
      findById: vi.fn().mockResolvedValue({
        id: 'referrer-1',
        name: 'Jane',
        stripeCustomerId: 'cus_abc',
      }),
    },
    referral: {
      countByReferrer: vi.fn().mockResolvedValue(3),
      countCreditsEarned: vi.fn().mockResolvedValue(3),
      hasBeenReferred: vi.fn().mockResolvedValue(false),
      create: vi.fn().mockResolvedValue({ id: 'ref-1' }),
      findByRefereeId: vi.fn().mockResolvedValue({
        id: 'ref-1',
        referrerId: 'referrer-1',
        refereeId: 'referee-1',
        creditApplied: false,
      }),
      markCreditApplied: vi.fn().mockResolvedValue(undefined),
    },
  } as any;
}

function makeMockStripe() {
  return {
    customers: {
      createBalanceTransaction: vi.fn().mockResolvedValue({ id: 'txn_abc' }),
    },
    coupons: {
      retrieve: vi.fn().mockResolvedValue({ id: 'REFERRAL_FREE_MONTH' }),
      create: vi.fn().mockResolvedValue({ id: 'REFERRAL_FREE_MONTH' }),
    },
  } as any;
}

describe('ReferralService', () => {
  let service: ReferralServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;
  let stripe: ReturnType<typeof makeMockStripe>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    stripe = makeMockStripe();
    service = createReferralService(repos, { stripeClient: stripe });
  });

  describe('getOrCreateReferralCode', () => {
    it('should return referral code', async () => {
      const code = await service.getOrCreateReferralCode('user-1');
      expect(code).toBe('ABC123');
      expect(repos.user.getOrCreateReferralCode).toHaveBeenCalledWith('user-1');
    });

    it('should return null when repo returns null', async () => {
      repos.user.getOrCreateReferralCode.mockResolvedValueOnce(null);
      const code = await service.getOrCreateReferralCode('user-1');
      expect(code).toBeNull();
    });
  });

  describe('getReferralStats', () => {
    it('should return full stats with referral link', async () => {
      const stats = await service.getReferralStats('user-1');
      expect(stats).toEqual({
        referralCode: 'ABC123',
        referralLink: 'https://gymtext.com/r/ABC123',
        completedReferrals: 3,
        creditsEarned: 3,
        creditsRemaining: 9, // 12 - 3
      });
    });

    it('should return null when no referral code', async () => {
      repos.user.getOrCreateReferralCode.mockResolvedValueOnce(null);
      const stats = await service.getReferralStats('user-1');
      expect(stats).toBeNull();
    });

    it('should clamp creditsRemaining to 0', async () => {
      repos.referral.countCreditsEarned.mockResolvedValueOnce(15); // over max
      const stats = await service.getReferralStats('user-1');
      expect(stats!.creditsRemaining).toBe(0);
    });
  });

  describe('validateReferralCode', () => {
    it('should validate a valid code', async () => {
      const result = await service.validateReferralCode('ABC123');
      expect(result).toEqual({
        valid: true,
        referrerId: 'referrer-1',
        referrerName: 'Jane',
      });
    });

    it('should reject empty code', async () => {
      const result = await service.validateReferralCode('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid');
    });

    it('should reject wrong-length code', async () => {
      const result = await service.validateReferralCode('AB');
      expect(result.valid).toBe(false);
    });

    it('should reject unknown code', async () => {
      repos.user.findByReferralCode.mockResolvedValueOnce(null);
      const result = await service.validateReferralCode('XXXXXX');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should reject self-referral', async () => {
      const result = await service.validateReferralCode('ABC123', '+11234567890');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('own referral');
    });
  });

  describe('completeReferral', () => {
    it('should create referral record', async () => {
      await service.completeReferral('ABC123', 'referee-1');
      expect(repos.referral.create).toHaveBeenCalledWith('referrer-1', 'referee-1');
    });

    it('should skip if code not found', async () => {
      repos.user.findByReferralCode.mockResolvedValueOnce(null);
      await service.completeReferral('XXXXXX', 'referee-1');
      expect(repos.referral.create).not.toHaveBeenCalled();
    });

    it('should skip if already referred', async () => {
      repos.referral.hasBeenReferred.mockResolvedValueOnce(true);
      await service.completeReferral('ABC123', 'referee-1');
      expect(repos.referral.create).not.toHaveBeenCalled();
    });
  });

  describe('creditReferrer', () => {
    it('should apply Stripe credit and mark applied', async () => {
      const result = await service.creditReferrer('referee-1');
      expect(result.success).toBe(true);
      expect(result.creditId).toBe('txn_abc');
      expect(stripe.customers.createBalanceTransaction).toHaveBeenCalledWith(
        'cus_abc',
        expect.objectContaining({ amount: -1999, currency: 'usd' })
      );
      expect(repos.referral.markCreditApplied).toHaveBeenCalled();
    });

    it('should return success when no referral found', async () => {
      repos.referral.findByRefereeId.mockResolvedValueOnce(null);
      const result = await service.creditReferrer('unknown');
      expect(result.success).toBe(true);
      expect(stripe.customers.createBalanceTransaction).not.toHaveBeenCalled();
    });

    it('should skip if credit already applied', async () => {
      repos.referral.findByRefereeId.mockResolvedValueOnce({
        id: 'ref-1', referrerId: 'referrer-1', creditApplied: true,
      });
      const result = await service.creditReferrer('referee-1');
      expect(result.success).toBe(true);
      expect(stripe.customers.createBalanceTransaction).not.toHaveBeenCalled();
    });

    it('should skip if referrer at max credits', async () => {
      repos.referral.countCreditsEarned.mockResolvedValueOnce(12);
      const result = await service.creditReferrer('referee-1');
      expect(result.success).toBe(true);
      expect(stripe.customers.createBalanceTransaction).not.toHaveBeenCalled();
    });

    it('should fail if referrer has no Stripe customer', async () => {
      repos.user.findById.mockResolvedValueOnce({ id: 'referrer-1', stripeCustomerId: null });
      const result = await service.creditReferrer('referee-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Stripe');
    });

    it('should handle Stripe API errors', async () => {
      stripe.customers.createBalanceTransaction.mockRejectedValueOnce(new Error('Stripe down'));
      const result = await service.creditReferrer('referee-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Stripe down');
    });
  });

  describe('getRefereeCouponId', () => {
    it('should return existing coupon id', async () => {
      const id = await service.getRefereeCouponId();
      expect(id).toBe('REFERRAL_FREE_MONTH');
      expect(stripe.coupons.create).not.toHaveBeenCalled();
    });

    it('should create coupon if not found', async () => {
      stripe.coupons.retrieve.mockRejectedValueOnce(new Error('not found'));
      const id = await service.getRefereeCouponId();
      expect(id).toBe('REFERRAL_FREE_MONTH');
      expect(stripe.coupons.create).toHaveBeenCalled();
    });
  });

  describe('canEarnCredits', () => {
    it('should return true when under max', async () => {
      repos.referral.countCreditsEarned.mockResolvedValueOnce(5);
      expect(await service.canEarnCredits('user-1')).toBe(true);
    });

    it('should return false when at max', async () => {
      repos.referral.countCreditsEarned.mockResolvedValueOnce(12);
      expect(await service.canEarnCredits('user-1')).toBe(false);
    });
  });
});
