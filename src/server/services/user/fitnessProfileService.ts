import { ProfileRepository } from '@/server/repositories/profileRepository';

export class FitnessProfileService {
  private static instance: FitnessProfileService;
  private profileRepository: ProfileRepository;

  private constructor() {
    this.profileRepository = new ProfileRepository();
  }

  public static getInstance(): FitnessProfileService {
    if (!FitnessProfileService.instance) {
      FitnessProfileService.instance = new FitnessProfileService();
    }
    return FitnessProfileService.instance;
  }

  /**
   * Get current Markdown profile for a user
   *
   * @param userId - UUID of the user
   * @returns Markdown profile text or null if no profile exists
   */
  async getCurrentMarkdownProfile(userId: string): Promise<string | null> {
    try {
      return await this.profileRepository.getCurrentProfileText(userId);
    } catch (error) {
      console.error(`[FitnessProfileService] Error getting Markdown profile for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Save updated Markdown profile
   * Creates new row in profiles table for history tracking
   *
   * @param userId - UUID of the user
   * @param markdownProfile - Complete Markdown profile text
   */
  async saveMarkdownProfile(userId: string, markdownProfile: string): Promise<void> {
    try {
      await this.profileRepository.createProfileForUser(userId, markdownProfile);
      console.log(`[FitnessProfileService] Saved Markdown profile for user ${userId}`);
    } catch (error) {
      console.error(`[FitnessProfileService] Error saving Markdown profile for user ${userId}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const fitnessProfileService = FitnessProfileService.getInstance();