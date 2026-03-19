import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOnboardingCoordinator } from '../orchestration/onboardingCoordinator';
import type { OnboardingCoordinatorInstance, OnboardingCoordinatorDeps } from '../orchestration/onboardingCoordinator';

function makeMockDeps(): OnboardingCoordinatorDeps {
  return {
    onboardingData: {
      hasMessagesSent: vi.fn().mockResolvedValue(false),
      findByClientId: vi.fn().mockResolvedValue({ status: 'completed' }),
      markMessagesSent: vi.fn().mockResolvedValue(undefined),
    },
    user: {
      getUser: vi.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        phone: '+15551234567',
      }),
    },
    onboarding: {
      sendOnboardingMessages: vi.fn().mockResolvedValue(undefined),
    },
    subscription: {
      hasActiveSubscription: vi.fn().mockResolvedValue(true),
    },
  } as any;
}

describe('OnboardingCoordinator', () => {
  let coordinator: OnboardingCoordinatorInstance;
  let deps: ReturnType<typeof makeMockDeps>;

  beforeEach(() => {
    vi.clearAllMocks();
    deps = makeMockDeps();
    coordinator = createOnboardingCoordinator(deps);
  });

  it('should send onboarding messages when all conditions are met', async () => {
    const result = await coordinator.sendOnboardingMessages('user-1');

    expect(result).toBe(true);
    expect(deps.onboarding.sendOnboardingMessages).toHaveBeenCalled();
    expect(deps.onboardingData.markMessagesSent).toHaveBeenCalledWith('user-1');
  });

  it('should skip if messages already sent', async () => {
    (deps.onboardingData.hasMessagesSent as any).mockResolvedValue(true);

    const result = await coordinator.sendOnboardingMessages('user-1');

    expect(result).toBe(false);
    expect(deps.onboarding.sendOnboardingMessages).not.toHaveBeenCalled();
  });

  it('should skip if onboarding not completed', async () => {
    (deps.onboardingData.findByClientId as any).mockResolvedValue({ status: 'in_progress' });

    const result = await coordinator.sendOnboardingMessages('user-1');

    expect(result).toBe(false);
    expect(deps.onboarding.sendOnboardingMessages).not.toHaveBeenCalled();
  });

  it('should skip if no onboarding record exists', async () => {
    (deps.onboardingData.findByClientId as any).mockResolvedValue(null);

    const result = await coordinator.sendOnboardingMessages('user-1');

    expect(result).toBe(false);
    expect(deps.onboarding.sendOnboardingMessages).not.toHaveBeenCalled();
  });

  it('should skip if no active subscription', async () => {
    (deps.subscription.hasActiveSubscription as any).mockResolvedValue(false);

    const result = await coordinator.sendOnboardingMessages('user-1');

    expect(result).toBe(false);
    expect(deps.onboarding.sendOnboardingMessages).not.toHaveBeenCalled();
  });

  it('should throw if user not found', async () => {
    (deps.user.getUser as any).mockResolvedValue(null);

    await expect(coordinator.sendOnboardingMessages('user-1')).rejects.toThrow('User user-1 not found');
  });

  it('should propagate errors from sendOnboardingMessages', async () => {
    (deps.onboarding.sendOnboardingMessages as any).mockRejectedValue(new Error('SMS failure'));

    await expect(coordinator.sendOnboardingMessages('user-1')).rejects.toThrow('SMS failure');
  });

  it('should not mark messages sent if sending fails', async () => {
    (deps.onboarding.sendOnboardingMessages as any).mockRejectedValue(new Error('failed'));

    await expect(coordinator.sendOnboardingMessages('user-1')).rejects.toThrow();
    expect(deps.onboardingData.markMessagesSent).not.toHaveBeenCalled();
  });

  it('should check conditions in correct order: messages sent → onboarding status → subscription', async () => {
    // All conditions fail, but only first should be checked
    (deps.onboardingData.hasMessagesSent as any).mockResolvedValue(true);
    (deps.onboardingData.findByClientId as any).mockResolvedValue(null);
    (deps.subscription.hasActiveSubscription as any).mockResolvedValue(false);

    await coordinator.sendOnboardingMessages('user-1');

    // Should short-circuit at hasMessagesSent
    expect(deps.onboardingData.findByClientId).not.toHaveBeenCalled();
    expect(deps.subscription.hasActiveSubscription).not.toHaveBeenCalled();
  });
});
