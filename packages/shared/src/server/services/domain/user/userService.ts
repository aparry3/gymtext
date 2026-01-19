import { UserModel, CreateUserData, UserWithProfile, User } from '@/server/models/user';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import type { AdminUser, AdminUsersResponse, AdminUserDetailResponse, UserFilters, UserSort, Pagination } from '@/shared/types/admin';
import { getTimezonesAtLocalTime } from '@/shared/utils/date';
import type { RepositoryContainer } from '../../../repositories/factory';

export interface CreateUserRequest {
  name: string;
  phoneNumber: string;
  age?: number;
  gender?: string;
  timezone: string;
  preferredSendHour: number;
  email?: string;
  stripeCustomerId?: string;
}

/**
 * UserServiceInstance interface
 *
 * Defines all public methods available on the user service.
 */
export interface UserServiceInstance {
  createUser(request: CreateUserRequest): Promise<UserWithProfile>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  getUser(userId: string): Promise<UserWithProfile | undefined | null>;
  getUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]>;
  getUsersForWeeklyMessage(currentUtcHour: number): Promise<UserWithProfile[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updatePreferences(userId: string, preferences: { preferredSendHour?: number; timezone?: string; name?: string }): Promise<UserWithProfile>;
  listUsersForAdmin(filters: UserFilters & { page?: number; pageSize?: number; sort?: UserSort }): Promise<AdminUsersResponse>;
  getUserForAdmin(id: string): Promise<AdminUserDetailResponse>;
  deleteUser(id: string): Promise<boolean>;
}

/**
 * Create a UserService instance with injected repositories
 *
 * @param repos - Repository container with all repositories
 * @returns UserServiceInstance
 */
export function createUserService(repos: RepositoryContainer): UserServiceInstance {
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 60000, // 1 minute
  });

  const transformToAdminUser = (user: UserWithProfile): AdminUser => {
    const hasProfile = Boolean(user.profile);

    return {
      ...user,
      hasProfile,
      profileSummary: undefined,
      stats: {
        totalWorkouts: 0,
        isActiveToday: false,
      },
    };
  };

  const calculateUserStats = async () => {
    const allUsersResult = await repos.user.list({ pageSize: 1000 });
    const users = allUsersResult.users;

    const totalUsers = users.length;
    const withEmail = users.filter((u) => u.email).length;
    const withProfile = users.filter((u) => u.profile).length;
    const activeToday = 0; // TODO: Implement active user tracking

    return {
      totalUsers,
      withEmail,
      withProfile,
      activeToday,
    };
  };

  return {
    async createUser(request: CreateUserRequest): Promise<UserWithProfile> {
      const result = await circuitBreaker.execute<UserWithProfile>(async (): Promise<UserWithProfile> => {
        // Check if user already exists using repository
        const existingUser = await repos.user.findByPhoneNumber(request.phoneNumber);
        if (existingUser) {
          throw new Error('User already exists with this phone number');
        }

        // Prepare user data
        const userData: CreateUserData = {
          name: request.name,
          phoneNumber: request.phoneNumber,
          age: request.age || null,
          gender: request.gender || null,
          timezone: request.timezone,
          preferredSendHour: request.preferredSendHour,
          email: request.email || null,
          stripeCustomerId: request.stripeCustomerId || null,
        };

        // Validate user data using domain model
        UserModel.validateUserData(userData);

        // Create the user using repository
        const user = await repos.user.create(userData);
        if (!user) {
          throw new Error('Failed to create user');
        }

        return user;
      });

      if (!result) {
        throw new Error('Failed to create user');
      }

      return result;
    },

    async getUserById(id: string): Promise<User | undefined> {
      const result = await circuitBreaker.execute(async () => {
        return await repos.user.findById(id);
      });
      return result || undefined;
    },

    async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
      const result = await circuitBreaker.execute(async () => {
        return await repos.user.findByPhoneNumber(phoneNumber);
      });
      return result || undefined;
    },

    async getUser(userId: string): Promise<UserWithProfile | undefined | null> {
      return await circuitBreaker.execute(async () => {
        return await repos.user.findWithProfile(userId);
      });
    },

    async getUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]> {
      const result = await circuitBreaker.execute(async () => {
        return await repos.user.findUsersForHour(currentUtcHour);
      });
      return result || [];
    },

    async getUsersForWeeklyMessage(currentUtcHour: number): Promise<UserWithProfile[]> {
      const result = await circuitBreaker.execute(async () => {
        // Business logic: Weekly messages are sent at 5pm on Sundays
        const targetLocalHour = 17; // 5pm
        const sunday = 7; // Luxon weekday (7 = Sunday)

        // Calculate current UTC date
        const currentUtcDate = new Date();
        currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);

        // Get all timezones that are currently at 5pm on Sunday
        const matchingTimezones = getTimezonesAtLocalTime(currentUtcDate, targetLocalHour, sunday);

        // Query users in those timezones
        return await repos.user.findUsersByTimezones(matchingTimezones);
      });
      return result || [];
    },

    async updateUser(id: string, updates: Partial<User>): Promise<User> {
      const result = await circuitBreaker.execute(async () => {
        // Validate updates using domain model
        UserModel.validateUserUpdates(updates);

        // Update using repository
        return await repos.user.update(id, updates);
      });

      if (!result) {
        throw new Error('Failed to update user');
      }

      return result;
    },

    async updatePreferences(
      userId: string,
      preferences: { preferredSendHour?: number; timezone?: string; name?: string }
    ): Promise<UserWithProfile> {
      const result = await circuitBreaker.execute(async () => {
        return await repos.user.updatePreferences(userId, preferences);
      });

      if (!result) {
        throw new Error('Failed to update preferences');
      }

      return result;
    },

    // Admin-specific methods
    async listUsersForAdmin(
      filters: UserFilters & { page?: number; pageSize?: number; sort?: UserSort }
    ): Promise<AdminUsersResponse> {
      const result = await circuitBreaker.execute(async () => {
        const { page = 1, pageSize = 20, sort = { field: 'createdAt', direction: 'desc' }, ...restFilters } = filters;

        // Convert admin filters to repository filters
        const repoParams = {
          q: restFilters.search,
          hasProfile: restFilters.hasProfile,
          createdFrom: restFilters.createdAfter,
          createdTo: restFilters.createdBefore,
          page,
          pageSize,
          sort: `${sort.field}:${sort.direction}`,
        };

        const { users, total } = await repos.user.list(repoParams);

        // Transform users to AdminUser format
        const adminUsers: AdminUser[] = users.map((user) => transformToAdminUser(user));

        // Calculate stats
        const stats = await calculateUserStats();

        const pagination: Pagination = {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        };

        return {
          users: adminUsers,
          pagination,
          stats,
        };
      });

      if (!result) {
        throw new Error('Failed to fetch users');
      }

      return result;
    },

    async getUserForAdmin(id: string): Promise<AdminUserDetailResponse> {
      const result = await circuitBreaker.execute(async () => {
        const user = await repos.user.findWithProfile(id);
        if (!user) {
          throw new Error('User not found');
        }

        const adminUser = transformToAdminUser(user);

        // Fetch signup data from onboarding
        const signupData = await repos.onboarding.getSignupData(id);

        // Fetch subscription status
        const subscriptions = await repos.subscription.findByClientId(id);
        const latestSubscription = subscriptions[0]; // Already ordered by createdAt desc
        let subscriptionStatus: 'active' | 'cancel_pending' | 'canceled' | 'none' = 'none';
        if (latestSubscription) {
          if (latestSubscription.status === 'active') {
            subscriptionStatus = 'active';
          } else if (latestSubscription.status === 'cancel_pending') {
            subscriptionStatus = 'cancel_pending';
          } else if (latestSubscription.status === 'canceled') {
            subscriptionStatus = 'canceled';
          }
        }

        return {
          user: adminUser,
          profile: user.profile || null,
          signupData,
          subscriptionStatus,
          recentActivity: {
            totalMessages: 0,
            totalWorkouts: 0,
          },
        };
      });

      if (!result) {
        throw new Error('Failed to fetch user');
      }

      return result;
    },

    async deleteUser(id: string): Promise<boolean> {
      const result = await circuitBreaker.execute(async () => {
        // Verify user exists first
        const user = await repos.user.findById(id);
        if (!user) {
          return false;
        }

        // Delete user and all cascaded data
        return await repos.user.delete(id);
      });

      return result || false;
    },
  };
}

// =============================================================================
