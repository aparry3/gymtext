import { BaseRepository } from '@/server/repositories/baseRepository';
import { type User, type UserWithProfile, type CreateUserData } from '@/server/models/user';
export declare class UserRepository extends BaseRepository {
    list(params: {
        q?: string;
        status?: string;
        hasProfile?: boolean;
        hasPlan?: boolean;
        createdFrom?: string;
        createdTo?: string;
        page?: number;
        pageSize?: number;
        sort?: string;
    }): Promise<{
        users: UserWithProfile[];
        total: number;
    }>;
    create(userData: CreateUserData): Promise<UserWithProfile | undefined>;
    findById(id: string): Promise<UserWithProfile | undefined>;
    findByPhoneNumber(phoneNumber: string): Promise<UserWithProfile | undefined>;
    findByEmail(email: string): Promise<UserWithProfile | undefined>;
    findByStripeCustomerId(stripeCustomerId: string): Promise<UserWithProfile | undefined>;
    update(id: string, userData: Partial<CreateUserData>): Promise<UserWithProfile | undefined>;
    /**
     * Find user with latest profile
     * Performs LEFT JOIN with profiles table to get most recent profile
     */
    findWithProfile(userId: string): Promise<UserWithProfile | undefined>;
    updatePreferences(userId: string, preferences: {
        preferredSendHour?: number;
        timezone?: string;
        name?: string;
    }): Promise<UserWithProfile | undefined>;
    findUsersForHour(currentUtcHour: number): Promise<UserWithProfile[]>;
    findUsersByTimezones(timezones: string[]): Promise<UserWithProfile[]>;
    findActiveUsersWithPreferences(): Promise<User[]>;
    delete(id: string): Promise<boolean>;
    /**
     * Generate a random 6-character referral code
     * Uses uppercase letters and numbers, excluding confusing characters (O/0, I/1, L)
     */
    generateReferralCode(): string;
    /**
     * Get or create a referral code for a user
     * If the user already has a code, returns it; otherwise generates and saves a new one
     */
    getOrCreateReferralCode(userId: string): Promise<string | null>;
    /**
     * Find a user by their referral code
     * Used to validate referral codes during signup
     */
    findByReferralCode(code: string): Promise<UserWithProfile | undefined>;
}
//# sourceMappingURL=userRepository.d.ts.map