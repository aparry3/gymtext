import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSubscriptionService } from '../domain/subscription/subscriptionService';
import type { SubscriptionServiceInstance } from '../domain/subscription/subscriptionService';

// Mock Stripe - needs a class constructor since it's called with `new Stripe(...)`
vi.mock('stripe', () => {
  class MockStripe {
    subscriptions = {
      update: vi.fn().mockResolvedValue({ current_period_end: 1711929600 }),
      cancel: vi.fn().mockResolvedValue({}),
      retrieve: vi.fn().mockResolvedValue({ status: 'active', cancel_at_period_end: true }),
    };
    checkout = {
      sessions: {
        create: vi.fn().mockResolvedValue({ url: 'https://checkout.stripe.com/session_123' }),
      },
    };
  }
  return { default: MockStripe };
});

// Mock config
vi.mock('@/server/config', () => ({
  getStripeSecrets: () => ({ secretKey: 'sk_test_fake' }),
}));

vi.mock('@/shared/config', () => ({
  getStripeConfig: () => ({ priceId: 'price_test_123' }),
  getUrlsConfig: () => ({ publicBaseUrl: 'https://gymtext.co', baseUrl: 'https://gymtext.co' }),
}));

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    phone: '+15551234567',
    name: 'Test User',
    stripeCustomerId: 'cus_test_123',
    messagingOptIn: true,
    messagingOptInDate: new Date(),
    ...overrides,
  };
}

function makeSubscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'sub-1',
    clientId: 'user-1',
    stripeSubscriptionId: 'sub_stripe_123',
    status: 'active',
    currentPeriodEnd: new Date('2026-04-18'),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    user: {
      findById: vi.fn().mockResolvedValue(makeUser()),
      update: vi.fn().mockResolvedValue(makeUser()),
    },
    subscription: {
      getActiveSubscription: vi.fn().mockResolvedValue(makeSubscription()),
      findByClientId: vi.fn().mockResolvedValue([makeSubscription()]),
      findActiveForMessaging: vi.fn().mockResolvedValue(makeSubscription()),
      hasActiveSubscription: vi.fn().mockResolvedValue(true),
      scheduleCancellation: vi.fn(),
      cancel: vi.fn(),
      reactivate: vi.fn(),
    },
    // Stub other repos
    message: {}, fitnessProfile: {}, fitnessPlan: {}, microcycle: {},
    workout: {}, dayConfig: {}, queue: {}, shortLink: {},
    referral: {}, adminAuth: {}, onboardingData: {}, agentLog: {},
    organization: {}, program: {}, programVersion: {}, blog: {},
    exerciseMetrics: {}, messageQueue: {},
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

  describe('getSubscriptionStatus', () => {
    it('should return active for active subscription', async () => {
      const status = await service.getSubscriptionStatus('user-1');
      expect(status).toBe('active');
    });

    it('should return none when no subscriptions', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const status = await service.getSubscriptionStatus('user-1');
      expect(status).toBe('none');
    });

    it('should return cancel_pending for pending cancellation', async () => {
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'cancel_pending' }),
      ]);
      const status = await service.getSubscriptionStatus('user-1');
      expect(status).toBe('cancel_pending');
    });
  });

  describe('shouldReceiveMessages', () => {
    it('should return true for active subscription', async () => {
      const result = await service.shouldReceiveMessages('user-1');
      expect(result).toBe(true);
    });

    it('should return false when no active subscription', async () => {
      repos.subscription.findActiveForMessaging.mockResolvedValue(null);
      const result = await service.shouldReceiveMessages('user-1');
      expect(result).toBe(false);
    });
  });

  describe('hasActiveSubscription', () => {
    it('should delegate to repository', async () => {
      const result = await service.hasActiveSubscription('user-1');
      expect(result).toBe(true);
      expect(repos.subscription.hasActiveSubscription).toHaveBeenCalledWith('user-1');
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel via Stripe and update local DB', async () => {
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
      expect(result.periodEndDate).toBeTruthy();
      expect(repos.subscription.scheduleCancellation).toHaveBeenCalled();
    });

    it('should handle no active subscription', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(null);
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(false);
      expect(result.error).toContain('No active subscription');
    });

    it('should handle already cancel_pending', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(null);
      repos.subscription.findByClientId.mockResolvedValue([
        makeSubscription({ status: 'cancel_pending' }),
      ]);
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
    });

    it('should handle non-Stripe subscriptions (test/legacy)', async () => {
      repos.subscription.getActiveSubscription.mockResolvedValue(
        makeSubscription({ stripeSubscriptionId: 'sub_test_free_user' })
      );
      const result = await service.cancelSubscription('user-1');
      expect(result.success).toBe(true);
      // Should NOT call Stripe API for non-Stripe subscriptions
      expect(repos.subscription.scheduleCancellation).toHaveBeenCalled();
    });
  });

  describe('immediatelyCancelSubscription', () => {
    it('should immediately cancel and update DB', async () => {
      const result = await service.immediatelyCancelSubscription('user-1');
      expect(result.success).toBe(true);
      expect(result.canceledAt).toBeTruthy();
      expect(repos.subscription.cancel).toHaveBeenCalled();
    });

    it('should succeed when no subscription exists (cleanup scenario)', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.immediatelyCancelSubscription('user-1');
      expect(result.success).toBe(true);
    });
  });

  describe('processUnsubscribe', () => {
    it('should opt out user and cancel subscription', async () => {
      const result = await service.processUnsubscribe('user-1');
      expect(result.success).toBe(true);
      expect(result.alreadyInactive).toBe(false);
      expect(result.responseMessage).toBeTruthy();
      expect(repos.user.update).toHaveBeenCalledWith('user-1', expect.objectContaining({
        messagingOptIn: false,
      }));
    });

    it('should handle already opted out user', async () => {
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
      expect(result.checkoutUrl).toContain('checkout.stripe.com');
    });

    it('should create checkout session for new user with no subscription', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.processResubscribe('user-1');
      expect(result.requiresNewSubscription).toBe(true);
    });
  });
});
