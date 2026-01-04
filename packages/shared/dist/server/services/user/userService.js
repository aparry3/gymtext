import { UserModel } from '@/server/models/user';
import { UserRepository } from '@/server/repositories/userRepository';
import { OnboardingRepository } from '@/server/repositories/onboardingRepository';
import { CircuitBreaker } from '@/server/utils/circuitBreaker';
import { getTimezonesAtLocalTime } from '@/shared/utils/date';
export class UserService {
    static instance;
    userRepository;
    onboardingRepository;
    circuitBreaker;
    constructor() {
        this.userRepository = new UserRepository();
        this.onboardingRepository = new OnboardingRepository();
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeout: 60000, // 1 minute
            monitoringPeriod: 60000 // 1 minute
        });
    }
    static getInstance() {
        if (!UserService.instance) {
            UserService.instance = new UserService();
        }
        return UserService.instance;
    }
    async createUser(request) {
        const result = await this.circuitBreaker.execute(async () => {
            // Check if user already exists using repository
            const existingUser = await this.userRepository.findByPhoneNumber(request.phoneNumber);
            if (existingUser) {
                throw new Error('User already exists with this phone number');
            }
            // Prepare user data
            const userData = {
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
    async getUserById(id) {
        const result = await this.circuitBreaker.execute(async () => {
            return await this.userRepository.findById(id);
        });
        return result || undefined;
    }
    async getUserByPhone(phoneNumber) {
        const result = await this.circuitBreaker.execute(async () => {
            return await this.userRepository.findByPhoneNumber(phoneNumber);
        });
        return result || undefined;
    }
    async getUser(userId) {
        return await this.circuitBreaker.execute(async () => {
            return await this.userRepository.findWithProfile(userId);
        });
    }
    async getUsersForHour(currentUtcHour) {
        const result = await this.circuitBreaker.execute(async () => {
            return await this.userRepository.findUsersForHour(currentUtcHour);
        });
        return result || [];
    }
    async getUsersForWeeklyMessage(currentUtcHour) {
        const result = await this.circuitBreaker.execute(async () => {
            // Business logic: Weekly messages are sent at 5pm on Sundays
            const targetLocalHour = 17; // 5pm
            const sunday = 7; // Luxon weekday (7 = Sunday)
            // Calculate current UTC date
            const currentUtcDate = new Date();
            currentUtcDate.setUTCHours(currentUtcHour, 0, 0, 0);
            // Get all timezones that are currently at 5pm on Sunday
            const matchingTimezones = getTimezonesAtLocalTime(currentUtcDate, targetLocalHour, sunday);
            // Query users in those timezones
            return await this.userRepository.findUsersByTimezones(matchingTimezones);
        });
        return result || [];
    }
    async updateUser(id, updates) {
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
    async updatePreferences(userId, preferences) {
        const result = await this.circuitBreaker.execute(async () => {
            return await this.userRepository.updatePreferences(userId, preferences);
        });
        if (!result) {
            throw new Error('Failed to update preferences');
        }
        return result;
    }
    // Admin-specific methods
    async listUsersForAdmin(filters) {
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
            const adminUsers = users.map(user => this.transformToAdminUser(user));
            // Calculate stats
            const stats = await this.calculateUserStats();
            const pagination = {
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
    async getUserForAdmin(id) {
        const result = await this.circuitBreaker.execute(async () => {
            const user = await this.userRepository.findWithProfile(id);
            if (!user) {
                throw new Error('User not found');
            }
            const adminUser = this.transformToAdminUser(user);
            // Fetch signup data from onboarding
            const signupData = await this.onboardingRepository.getSignupData(id);
            return {
                user: adminUser,
                profile: user.profile || null,
                signupData,
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
    async deleteUser(id) {
        const result = await this.circuitBreaker.execute(async () => {
            // Verify user exists first
            const user = await this.userRepository.findById(id);
            if (!user) {
                return false;
            }
            // Delete user and all cascaded data
            return await this.userRepository.delete(id);
        });
        return result || false;
    }
    transformToAdminUser(user) {
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
    async calculateUserStats() {
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
