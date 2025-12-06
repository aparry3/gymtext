import { UserModel, CreateUserData, UserWithProfile } from '@/server/models/userModel';
import { UserRepository } from '@/server/repositories/userRepository';
import type { User } from '@/server/models/user/schemas';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import type { AdminUser, AdminUsersResponse, AdminUserDetailResponse, UserFilters, UserSort, Pagination } from '@/components/admin/types';
import { getTimezonesAtLocalTime } from '@/shared/utils/date';

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

export class UserService {
  private static instance: UserService;
  private userRepository: UserRepository;
  private circuitBreaker: CircuitBreaker;

  private constructor() {
    this.userRepository = new UserRepository();
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 60000 // 1 minute
    });
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async createUser(request: CreateUserRequest): Promise<UserWithProfile> {
    const result = await this.circuitBreaker.execute<UserWithProfile>(async (): Promise<UserWithProfile> => {
      // Check if user already exists using repository
      const existingUser = await this.userRepository.findByPhoneNumber(request.phoneNumber);
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
      const user = await this.userRepository.create(userData);
      if (!user) {
        throw new Error('Failed to create user');
      }

      return user;
    });
    
    if (!result) {
      throw new Error('Failed to create user');
    }
    
    return result;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findById(id);
    });
    return result || undefined;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findByPhoneNumber(phoneNumber);
    });
    return result || undefined;
  }

  async getUser(userId: string): Promise<UserWithProfile | undefined | null> {
    return await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findWithProfile(userId);
    });
  }

  async getUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.findUsersForHour(currentUtcHour);
    });
    return result || [];
  }

  async getUsersForWeeklyMessage(currentUtcHour: number): Promise<UserWithProfile[]> {
    const result = await this.circuitBreaker.execute(async () => {
      // Business logic: Weekly messages are sent at 5pm on Sundays
      const targetLocalHour = 17; // 5pm
      const sunday = 7; // Luxon weekday (7 = Sunday)

      // Calculate current UTC date
      const currentUtcDate = new Date();
      currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);

      // Get all timezones that are currently at 5pm on Sunday
      const matchingTimezones = getTimezonesAtLocalTime(
        currentUtcDate,
        targetLocalHour,
        sunday
      );

      // Query users in those timezones
      return await this.userRepository.findUsersByTimezones(matchingTimezones);
    });
    return result || [];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const result = await this.circuitBreaker.execute(async () => {
      // Validate updates using domain model
      UserModel.validateUserUpdates(updates);
      
      // Update using repository
      return await this.userRepository.update(id, updates);
    });
    
    if (!result) {
      throw new Error('Failed to update user');
    }
    
    return result;
  }

  async updatePreferences(userId: string, preferences: { preferredSendHour?: number; timezone?: string; name?: string }): Promise<UserWithProfile> {
    const result = await this.circuitBreaker.execute(async () => {
      return await this.userRepository.updatePreferences(userId, preferences);
    });

    if (!result) {
      throw new Error('Failed to update preferences');
    }

    return result;
  }

  // Admin-specific methods
  async listUsersForAdmin(filters: UserFilters & { page?: number; pageSize?: number; sort?: UserSort }): Promise<AdminUsersResponse> {
    const result = await this.circuitBreaker.execute(async () => {
      const { page = 1, pageSize = 20, sort = { field: 'createdAt', direction: 'desc' }, ...restFilters } = filters;
      
      // Convert admin filters to repository filters
      const repoParams = {
        q: restFilters.search,
        hasProfile: restFilters.hasProfile,
        createdFrom: restFilters.createdAfter,
        createdTo: restFilters.createdBefore,
        page,
        pageSize,
        sort: `${sort.field}:${sort.direction}`
      };

      const { users, total } = await this.userRepository.list(repoParams);
      
      // Transform users to AdminUser format
      const adminUsers: AdminUser[] = users.map(user => this.transformToAdminUser(user));
      
      // Calculate stats
      const stats = await this.calculateUserStats();

      const pagination: Pagination = {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      };

      return {
        users: adminUsers,
        pagination,
        stats
      };
    });

    if (!result) {
      throw new Error('Failed to fetch users');
    }

    return result;
  }

  async getUserForAdmin(id: string): Promise<AdminUserDetailResponse> {
    const result = await this.circuitBreaker.execute(async () => {
      const user = await this.userRepository.findWithProfile(id);
      if (!user) {
        throw new Error('User not found');
      }

      const adminUser = this.transformToAdminUser(user);

      return {
        user: adminUser,
        profile: user.profile || null,
        recentActivity: {
          totalMessages: 0,
          totalWorkouts: 0
        }
      };
    });

    if (!result) {
      throw new Error('Failed to fetch user');
    }

    return result;
  }

  private transformToAdminUser(user: UserWithProfile): AdminUser {
    const hasProfile = Boolean(user.profile);

    return {
      ...user,
      hasProfile,
      profileSummary: undefined, // Profile summary now comes from markdown profile parsing if needed
      stats: {
        totalWorkouts: 0,
        isActiveToday: false
      }
    };
  }

  private async calculateUserStats() {
    // Get basic counts from repository
    const allUsersResult = await this.userRepository.list({ pageSize: 1000 });
    const users = allUsersResult.users;

    const totalUsers = users.length;
    const withEmail = users.filter(u => u.email).length;
    // Count users with profiles by checking profile
    const withProfile = users.filter(u => u.profile).length;
    const activeToday = 0; // TODO: Implement active user tracking

    return {
      totalUsers,
      withEmail,
      withProfile,
      activeToday
    };
  }
}

// Export singleton instance
export const userService = UserService.getInstance();