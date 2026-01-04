export * from '@/shared/types/user';
import type { Users } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;
import type { FitnessProfile } from '@/shared/types/user';
export type CreateUserData = Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateFitnessProfileData = Partial<FitnessProfile>;
export type UserWithProfile = User & {
    profile?: string | null;
};
/**
 * UserModel - Domain logic and validation only
 * No direct repository access - Services orchestrate repository calls
 */
export declare class UserModel {
    static fromDb(user?: User): UserWithProfile | undefined;
    /**
     * Convert DB result with joined profile to UserWithProfile
     * Used when fetching user with profiles table joined
     */
    static fromDbWithProfile(dbResult: any): UserWithProfile;
    /**
     * Validates user data for creation
     * @param userData - User data to validate
     * @throws Error if validation fails
     */
    static validateUserData(userData: CreateUserData): void;
    /**
     * Validates user update data
     * @param updates - Update data to validate
     * @throws Error if validation fails
     */
    static validateUserUpdates(updates: Partial<User>): void;
    private static isValidEmail;
}
//# sourceMappingURL=user.d.ts.map