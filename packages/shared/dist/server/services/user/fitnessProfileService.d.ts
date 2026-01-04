/**
 * FitnessProfileService - Markdown-based Profile Management
 *
 * This service manages Markdown "Living Dossier" profiles with full history tracking.
 *
 * Key features:
 * - Uses ProfileRepository for Markdown profile storage
 * - Single Profile Update Agent for AI-powered profile creation
 * - Each update creates a new profile row (history tracking)
 * - Profiles stored as Markdown text
 * - Circuit breaker pattern for resilience
 */
import { UserWithProfile } from '@/server/models/user';
import { type StructuredProfile } from '@/server/models/profile';
import type { SignupData } from '@/server/repositories/onboardingRepository';
/**
 * Result returned when patching/updating a profile
 */
export interface ProfileUpdateResult {
    /** Updated Markdown profile text */
    profile: string;
    /** Whether the profile was actually updated */
    wasUpdated: boolean;
    /** Summary of changes made. Empty string if nothing was updated. */
    updateSummary: string;
}
export declare class FitnessProfileService {
    private static instance;
    private circuitBreaker;
    private profileRepository;
    private constructor();
    static getInstance(): FitnessProfileService;
    /**
     * Get the current Markdown profile for a user
     *
     * @param userId - UUID of the user
     * @returns Markdown profile text or null if no profile exists
     */
    getCurrentProfile(userId: string): Promise<string | null>;
    /**
     * Save updated profile
     * Creates new row in profiles table for history tracking
     *
     * @param userId - UUID of the user
     * @param profile - Complete profile text
     */
    saveProfile(userId: string, profile: string): Promise<void>;
    /**
     * Create initial fitness profile from signup data
     * Converts signup data to Markdown format and stores it
     *
     * @param user - User to create profile for
     * @param signupData - Onboarding signup data
     * @returns Markdown profile text
     */
    createFitnessProfile(user: UserWithProfile, signupData: SignupData): Promise<string | null>;
    /**
     * Get profile update history for a user
     *
     * @param userId - UUID of the user
     * @param limit - Number of historical profiles to retrieve
     * @returns Array of profile snapshots with timestamps
     */
    getProfileHistory(userId: string, limit?: number): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        structured: import("../..").JsonValue;
        profile: string;
    }[]>;
    /**
     * Save updated profile with structured data
     * Creates new row in profiles table for history tracking
     *
     * @param userId - UUID of the user
     * @param profile - Complete profile text (Markdown)
     * @param structured - Structured profile data (or null)
     */
    saveProfileWithStructured(userId: string, profile: string, structured: StructuredProfile | null): Promise<void>;
    /**
     * Get current structured profile data
     *
     * @param userId - UUID of the user
     * @returns Structured profile data or null if not available
     */
    getCurrentStructuredProfile(userId: string): Promise<StructuredProfile | null>;
}
export declare const fitnessProfileService: FitnessProfileService;
//# sourceMappingURL=fitnessProfileService.d.ts.map