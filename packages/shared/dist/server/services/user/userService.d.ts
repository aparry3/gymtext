import { UserWithProfile, User } from '@/server/models/user';
import type { AdminUsersResponse, AdminUserDetailResponse, UserFilters, UserSort } from '@/shared/types/admin';
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
export declare class UserService {
    private static instance;
    private userRepository;
    private onboardingRepository;
    private circuitBreaker;
    private constructor();
    static getInstance(): UserService;
    createUser(request: CreateUserRequest): Promise<UserWithProfile>;
    getUserById(id: string): Promise<User | undefined>;
    getUserByPhone(phoneNumber: string): Promise<User | undefined>;
    getUser(userId: string): Promise<UserWithProfile | undefined | null>;
    getUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]>;
    getUsersForWeeklyMessage(currentUtcHour: number): Promise<UserWithProfile[]>;
    updateUser(id: string, updates: Partial<User>): Promise<User>;
    updatePreferences(userId: string, preferences: {
        preferredSendHour?: number;
        timezone?: string;
        name?: string;
    }): Promise<UserWithProfile>;
    listUsersForAdmin(filters: UserFilters & {
        page?: number;
        pageSize?: number;
        sort?: UserSort;
    }): Promise<AdminUsersResponse>;
    getUserForAdmin(id: string): Promise<AdminUserDetailResponse>;
    deleteUser(id: string): Promise<boolean>;
    private transformToAdminUser;
    private calculateUserStats;
}
export declare const userService: UserService;
//# sourceMappingURL=userService.d.ts.map