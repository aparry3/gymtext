import { BaseRepository } from './baseRepository';
import type { Profiles } from '../models/_types';
import type { Selectable, Insertable } from 'kysely';
import type { StructuredProfile } from '@/server/models/profile';
export type Profile = Selectable<Profiles>;
export type NewProfile = Insertable<Profiles>;
/**
 * Profile with typed structured data
 * The database stores structured as JSONB, this interface casts it to the correct type
 */
export interface ProfileWithStructured extends Omit<Profile, 'structured'> {
    structured: StructuredProfile | null;
}
/**
 * ProfileRepository - Data access layer for Markdown-based fitness profiles
 *
 * This repository handles CRUD operations for the profiles table which stores
 * the history of user fitness profiles in Markdown format. Each update creates
 * a new row, providing full audit trail and versioning.
 */
export declare class ProfileRepository extends BaseRepository {
    /**
     * Get the current (most recent) profile for a user
     *
     * @param clientId - UUID of the user
     * @returns Most recent profile or undefined if no profiles exist
     */
    getCurrentProfile(clientId: string): Promise<Profile | undefined>;
    /**
     * Get the current profile text (Markdown) for a user
     *
     * @param clientId - UUID of the user
     * @returns Markdown profile text or null if no profiles exist
     */
    getCurrentProfileText(clientId: string): Promise<string | null>;
    /**
     * Create a new profile entry (appends to history)
     *
     * @param newProfile - Profile data to insert
     * @returns Created profile record
     */
    createProfile(newProfile: NewProfile): Promise<Profile>;
    /**
     * Create a new profile entry with just clientId and profile text
     * Convenience method for common use case
     *
     * @param clientId - UUID of the user
     * @param profileMarkdown - Markdown-formatted profile text
     * @returns Created profile record
     */
    createProfileForUser(clientId: string, profileMarkdown: string): Promise<Profile>;
    /**
     * Get profile history for a user
     *
     * @param clientId - UUID of the user
     * @param limit - Maximum number of historical profiles to retrieve (default: 10)
     * @returns Array of profile records, ordered by most recent first
     */
    getProfileHistory(clientId: string, limit?: number): Promise<Profile[]>;
    /**
     * Get profile as of a specific date
     * Returns the most recent profile that was created before or at the given date
     *
     * @param clientId - UUID of the user
     * @param date - Date to retrieve profile for
     * @returns Profile record or undefined if no profiles exist before that date
     */
    getProfileAtDate(clientId: string, date: Date): Promise<Profile | undefined>;
    /**
     * Count total profile updates for a user
     *
     * @param clientId - UUID of the user
     * @returns Number of profile updates in history
     */
    countProfileUpdates(clientId: string): Promise<number>;
    /**
     * Get the date of the last profile update
     *
     * @param clientId - UUID of the user
     * @returns Date of last update or null if no profiles exist
     */
    getLastUpdateDate(clientId: string): Promise<Date | null>;
    /**
     * Delete all profiles for a user (typically only for testing/cleanup)
     * WARNING: This removes all history
     *
     * @param clientId - UUID of the user
     * @returns Number of profiles deleted
     */
    deleteAllProfilesForUser(clientId: string): Promise<number>;
    /**
     * Get all users who have profiles
     *
     * @returns Array of distinct client IDs
     */
    getAllUsersWithProfiles(): Promise<string[]>;
    /**
     * Check if a user has any profiles
     *
     * @param clientId - UUID of the user
     * @returns True if user has at least one profile
     */
    hasProfile(clientId: string): Promise<boolean>;
    /**
     * Create a new profile entry with structured data
     * Convenience method that handles JSONB serialization
     *
     * @param clientId - UUID of the user
     * @param profileMarkdown - Markdown-formatted profile text
     * @param structured - Structured profile data (or null)
     * @returns Created profile record
     */
    createProfileWithStructured(clientId: string, profileMarkdown: string, structured: StructuredProfile | null): Promise<Profile>;
    /**
     * Get the current profile with typed structured data
     *
     * @param clientId - UUID of the user
     * @returns Most recent profile with typed structured field, or undefined
     */
    getCurrentProfileWithStructured(clientId: string): Promise<ProfileWithStructured | undefined>;
    /**
     * Get the current structured profile data only
     *
     * @param clientId - UUID of the user
     * @returns Structured profile data or null if not available
     */
    getCurrentStructuredProfile(clientId: string): Promise<StructuredProfile | null>;
}
//# sourceMappingURL=profileRepository.d.ts.map