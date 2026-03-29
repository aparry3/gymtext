import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUserService } from '../domain/user/userService';
import type { UserServiceInstance } from '../domain/user/userService';

// Mock CircuitBreaker to pass through
vi.mock('@/server/utils/circuitBreaker', () => ({
  CircuitBreaker: class {
    async execute<T>(fn: () => Promise<T>): Promise<T> {
      return fn();
    }
  },
}));

// Mock date utilities
vi.mock('@/shared/utils/date', () => ({
  getTimezonesAtLocalTime: vi.fn().mockReturnValue(['America/New_York', 'America/Detroit']),
}));

function makeMockRepos() {
  return {
    user: {
      findById: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Test', phoneNumber: '+15551234567' }),
      findByPhoneNumber: vi.fn().mockResolvedValue(null), // No existing user by default
      findWithProfile: vi.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Test User',
        phone: '+15551234567',
        profile: { id: 'prof-1' },
      }),
      findUsersForHour: vi.fn().mockResolvedValue([
        { id: 'user-1', name: 'Test', timezone: 'America/New_York' },
        { id: 'user-2', name: 'Test2', timezone: 'America/New_York' },
      ]),
      findUsersByTimezones: vi.fn().mockResolvedValue([
        { id: 'user-1', name: 'Test', timezone: 'America/New_York' },
      ]),
      create: vi.fn().mockResolvedValue({
        id: 'new-user',
        name: 'New User',
        phoneNumber: '+15559876543',
      }),
      update: vi.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Updated',
      }),
      updatePreferences: vi.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Test',
        timezone: 'US/Pacific',
      }),
      list: vi.fn().mockResolvedValue({
        users: [
          { id: 'user-1', name: 'Test', email: 'test@test.com', profile: { id: 'p1' } },
          { id: 'user-2', name: 'Test2', email: null, profile: null },
        ],
        total: 2,
      }),
      delete: vi.fn().mockResolvedValue(true),
    },
    profile: {
      getAllUsersWithProfiles: vi.fn().mockResolvedValue(['user-1', 'user-3']),
    },
    onboarding: {
      getSignupData: vi.fn().mockResolvedValue({ goals: 'Get fit' }),
    },
    subscription: {
      findByClientId: vi.fn().mockResolvedValue([{ status: 'active' }]),
    },
  } as any;
}

describe('UserService', () => {
  let service: UserServiceInstance;
  let repos: ReturnType<typeof makeMockRepos>;

  beforeEach(() => {
    vi.clearAllMocks();
    repos = makeMockRepos();
    service = createUserService(repos);
  });

  // ===========================================================================
  // createUser
  // ===========================================================================
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      const user = await service.createUser({
        name: 'New User',
        phoneNumber: '+15559876543',
        timezone: 'America/New_York',
        preferredSendHour: 8,
      });

      expect(repos.user.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New User',
        phoneNumber: '+15559876543',
        timezone: 'America/New_York',
        preferredSendHour: 8,
      }));
      expect(user.id).toBe('new-user');
    });

    it('should reject duplicate phone numbers', async () => {
      repos.user.findByPhoneNumber.mockResolvedValue({ id: 'existing' });

      await expect(service.createUser({
        name: 'Dupe',
        phoneNumber: '+15551234567',
        timezone: 'America/New_York',
        preferredSendHour: 8,
      })).rejects.toThrow('User already exists');
    });

    it('should set optional fields to null when not provided', async () => {
      await service.createUser({
        name: 'Minimal',
        phoneNumber: '+15559876543',
        timezone: 'America/New_York',
        preferredSendHour: 8,
      });

      expect(repos.user.create).toHaveBeenCalledWith(expect.objectContaining({
        age: null,
        gender: null,
        email: null,
        stripeCustomerId: null,
      }));
    });
  });

  // ===========================================================================
  // getUser / getUserById / getUserByPhone
  // ===========================================================================
  describe('user retrieval', () => {
    it('should get user by ID', async () => {
      const user = await service.getUserById('user-1');
      expect(repos.user.findById).toHaveBeenCalledWith('user-1');
      expect(user?.id).toBe('user-1');
    });

    it('should return undefined for nonexistent user', async () => {
      repos.user.findById.mockResolvedValue(null);
      const user = await service.getUserById('nope');
      expect(user).toBeUndefined();
    });

    it('should get user by phone', async () => {
      repos.user.findByPhoneNumber.mockResolvedValue({ id: 'user-1', phoneNumber: '+15551234567' });
      const user = await service.getUserByPhone('+15551234567');
      expect(user?.id).toBe('user-1');
    });

    it('should get user with profile', async () => {
      const user = await service.getUser('user-1');
      expect(repos.user.findWithProfile).toHaveBeenCalledWith('user-1');
      expect(user?.profile).toBeDefined();
    });
  });

  // ===========================================================================
  // getUsersForHour / getUsersForWeeklyMessage
  // ===========================================================================
  describe('batch user queries', () => {
    it('should get users for a given UTC hour', async () => {
      const users = await service.getUsersForHour(14);
      expect(repos.user.findUsersForHour).toHaveBeenCalledWith(14);
      expect(users).toHaveLength(2);
    });

    it('should return empty array on failure', async () => {
      repos.user.findUsersForHour.mockResolvedValue(null);
      const users = await service.getUsersForHour(14);
      expect(users).toEqual([]);
    });

    it('should get users for weekly message by timezone matching', async () => {
      const users = await service.getUsersForWeeklyMessage(22);
      expect(repos.user.findUsersByTimezones).toHaveBeenCalled();
      expect(users).toHaveLength(1);
    });
  });

  // ===========================================================================
  // updateUser / updatePreferences
  // ===========================================================================
  describe('user updates', () => {
    it('should update user fields', async () => {
      const updated = await service.updateUser('user-1', { name: 'Updated' });
      expect(repos.user.update).toHaveBeenCalledWith('user-1', { name: 'Updated' });
      expect(updated.name).toBe('Updated');
    });

    it('should update preferences', async () => {
      const result = await service.updatePreferences('user-1', { timezone: 'US/Pacific' });
      expect(repos.user.updatePreferences).toHaveBeenCalledWith('user-1', { timezone: 'US/Pacific' });
      expect(result.timezone).toBe('US/Pacific');
    });
  });

  // ===========================================================================
  // deleteUser
  // ===========================================================================
  describe('deleteUser', () => {
    it('should delete existing user', async () => {
      const result = await service.deleteUser('user-1');
      expect(result).toBe(true);
      expect(repos.user.delete).toHaveBeenCalledWith('user-1');
    });

    it('should return false for nonexistent user', async () => {
      repos.user.findById.mockResolvedValue(null);
      const result = await service.deleteUser('nope');
      expect(result).toBe(false);
      expect(repos.user.delete).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getUserIdsWithProfiles
  // ===========================================================================
  describe('getUserIdsWithProfiles', () => {
    it('should return user IDs from profile repo', async () => {
      const ids = await service.getUserIdsWithProfiles();
      expect(ids).toEqual(['user-1', 'user-3']);
      expect(repos.profile.getAllUsersWithProfiles).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // Admin methods
  // ===========================================================================
  describe('listUsersForAdmin', () => {
    it('should transform users to admin format with pagination', async () => {
      const result = await service.listUsersForAdmin({ page: 1, pageSize: 20 });

      expect(result.users).toHaveLength(2);
      expect(result.users[0]).toHaveProperty('hasProfile');
      expect(result.pagination.total).toBe(2);
      expect(result.stats).toHaveProperty('totalUsers');
    });

    it('should pass search filters to repo', async () => {
      await service.listUsersForAdmin({ search: 'test', page: 1, pageSize: 10 });

      expect(repos.user.list).toHaveBeenCalledWith(expect.objectContaining({
        q: 'test',
        page: 1,
        pageSize: 10,
      }));
    });
  });

  describe('getUserForAdmin', () => {
    it('should return user detail with signup data and subscription status', async () => {
      const result = await service.getUserForAdmin('user-1');

      expect(result.user).toBeDefined();
      expect(result.signupData).toEqual({ goals: 'Get fit' });
      expect(result.subscriptionStatus).toBe('active');
    });

    it('should throw if user not found', async () => {
      repos.user.findWithProfile.mockResolvedValue(null);
      await expect(service.getUserForAdmin('nope')).rejects.toThrow('User not found');
    });

    it('should return none subscription status when no subscriptions', async () => {
      repos.subscription.findByClientId.mockResolvedValue([]);
      const result = await service.getUserForAdmin('user-1');
      expect(result.subscriptionStatus).toBe('none');
    });
  });
});
