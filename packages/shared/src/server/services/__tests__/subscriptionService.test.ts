import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSubscriptionService } from '../domain/subscription/subscriptionService';
import type { SubscriptionServiceInstance } from '../domain/subscription/subscriptionService';

// Mock Stripe
vi.mock('stripe', () => {
  const mockStripe = {
    subscriptions: {
      update: vi.fn().mockResolvedValue({
        id: 'sub_123',
        cancel_at_period_end: true,
        current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
      }),
      cancel: vi.fn().mockResolvedValue({ id: 'sub_123', status: 'canceled' }),
      retrieve: vi.fn().mockResolvedValue({
        id: 'sub_123',
        status: 'active',
        cancel_at_period_end: true,
      }),
    },
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          id: 'cs_123',
          url: 'https://checkout.stripe.com/session/cs_123',
        }),
      },
    },
  };
  return {
    default: class MockStripe {
      constructor() {
        return mockStripe;
      }
    },
  };
});

// Mock config
vi.mock('@/server/config', () => ({
  getStripeSecrets: () => ({ secretKey: 'sk_test_123' }),
}));

vi.mock('@/shared/config', () => ({
  getStripeConfig: () => ({ priceId: 'price_123' }),
  getUrlsConfig: () => ({ publicBaseUrl: 'https://gymtext.co', baseUrl: 'https://gymtext.co' }),
}));

function makeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-db-1',
    clientId: 'user-1',
    stripeSubscriptionId: 'sub_stripe_123',
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(),
    ...overrides,
  };
}

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    phone: '+15551234567',
    name: 'Test User',
    messagingOptIn: true,
    stripeCustomerId: 'cus_123',
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    subscription: {
      getActiveSubscription: vi.fn().mockResolvedValue(makeSubscription()),
      findByClientId: vi.fn().mockResolvedValue([makeSubscription()]),
      findActiveForMessaging: vi.fn().mockResolvedValue(makeSubscription()),
      hasActiveSubscription: vi.fn().mockResolvedValue(true),
      scheduleCancellation: vi.fn(),
      cancel: vi.fn(),
      reactivate: vi.fn(),
    },
    user: {
      findById: vi.fn().mockResolvedValue(makeUser()),
      update: vi.fn(),
    },
  } as any;
}

describe('SubscriptionService', () => {
  let service: SubscriptionServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createSubscriptionService(repos);
  });

  describe('cancelSubscription', () => {
    it('should cancel active subscription via Stripe', async () => {
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
      expect(result.periodEndDate).toBeDefined();
      expect(repos.subscription.scheduleCancellation).toHaveBeenCalled();
    });

    it('should handle already-canceling subscription', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(null);
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'cancel_pending' }),
      ]);
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
    });

    it('should return error if no subscription found', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(null);
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No active subscription');
    });

    it('should handle non-Stripe subscriptions locally', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(
        makeSubscription({ stripeSubscriptionId: 'sub_test_123' })
      );
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
      expect(repos.subscription.scheduleCancellation).toHaveBeenCalled();
    });
  });

  describe('immediatelyCancelSubscription', () => {
    it('should immediately cancel and update DB', async () => {
      repos.subscription.findByClientId.mockResolvedValue([makeSubscription()]);
      const result = await service.immediatelyCancelSubscription('user-1');
      expect(result.success).toBe(true);
      expect(result.canceledAt).toBeDefined();
      expect(repos.subscription.cancel).toHaveBeenCalled();
    });

    it('should succeed when no subscription exists (cleanup scenario)', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.immediatelyCancelSubscription('user-1');
      expect(result.success).toBe(true);
    });
  });

  describe('shouldReceiveMessages', () => {
    it('should return true for active subscription', async () => {
      expect(await service.shouldReceiveMessages('user-1')).toBe(true);
    });

    it('should return false for no subscription', async () => {
      repos.subscription.findActiveForMessaging.mockResolvedValue(null);
      expect(await service.shouldReceiveMessages('user-1')).toBe(false);
    });
  });

  describe('getSubscriptionStatus', () => {
    it('should return active status', async () => {
      expect(await service.getSubscriptionStatus('user-1')).toBe('active');
    });

    it('should return none when no subscriptions', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      expect(await service.getSubscriptionStatus('user-1')).toBe('none');
    });

    it('should return cancel_pending status', async () => {
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'cancel_pending' }),
      ]);
      expect(await service.getSubscriptionStatus('user-1')).toBe('cancel_pending');
    });
  });

  describe('processUnsubscribe', () => {
    it('should opt out user and cancel subscription', async () => {
      const result = await service.processUnsubscribe('user-1');
      expect(result.success).toBe(true);
      expect(result.alreadyInactive).toBe(false);
      expect(repos.user.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
        messagingOptIn: false,
      }));
    });

    it('should return already inactive if user opted out', async () => {
      repos.user.findById.mockResolvedValue(makeUser({ messagingOptIn: false }));
      const result = await service.processUnsubscribe('user-1');
      expect(result.alreadyInactive).toBe(true);
    });

    it('should handle missing user', async () => {
      repos.user.findById.mockResolvedValue(null);
      const result = await service.processUnsubscribe('user-1');
      expect(result.success).toBe(false);
    });
  });

  describe('processResubscribe', () => {
    it('should reactivate cancel_pending subscription', async () => {
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'cancel_pending' }),
      ]);
      const result = await service.processResubscribe('user-1');
      expect(result.success).toBe(true);
      expect(result.reactivated).toBe(true);
      expect(repos.user.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
        messagingOptIn: true,
      }));
    });

    it('should return already active for active subscription', async () => {
      const result = await service.processResubscribe('user-1');
      expect(result.success).toBe(true);
      expect(result.reactivated).toBe(false);
      expect(result.requiresNewSubscription).toBe(false);
    });

    it('should create checkout session for canceled subscription', async () => {
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'canceled' }),
      ]);
      const result = await service.processResubscribe('user-1');
      expect(result.success).toBe(true);
      expect(result.requiresNewSubscription).toBe(true);
      expect(result.checkoutUrl).toBeTruthy();
    });

    it('should create checkout for users with no subscription', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.processResubscribe('user-1');
      expect(result.requiresNewSubscription).toBe(true);
      expect(result.checkoutUrl).toBeTruthy();
    });
  });
});
