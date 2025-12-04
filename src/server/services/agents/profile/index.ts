import { userService } from '../../user/userService';
import { fitnessProfileService } from '../../user/fitnessProfileService';
import { createProfileUpdateAgent } from '@/server/agents/profile';
import { formatForAI } from '@/shared/utils/date';
import type { ToolResult } from '../shared/types';

/**
 * ProfileService - Orchestration service for profile agent
 *
 * Handles profile updates via the profile agent.
 * Uses entity services (UserService, FitnessProfileService) for data access.
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For entity CRUD operations, use FitnessProfileService directly.
 */
export class ProfileService {
  /**
   * Update profile from a user message
   *
   * Fetches context via entity services, calls the profile agent,
   * persists updates, and returns a standardized ToolResult.
   *
   * @param userId - The user's ID
   * @param message - The user's message to extract profile info from
   * @returns ToolResult with response summary and optional messages
   */
  static async updateProfile(userId: string, message: string): Promise<ToolResult> {
    console.log('[PROFILE_SERVICE] Processing profile update:', {
      userId,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
    });

    try {
      // Fetch context via entity services
      const user = await userService.getUser(userId);
      if (!user) {
        console.warn('[PROFILE_SERVICE] User not found:', userId);
        return { response: 'User not found.' };
      }

      const currentProfile = await fitnessProfileService.getCurrentProfile(userId) ?? '';

      // Call profile agent
      const agent = createProfileUpdateAgent();
      const result = await agent.invoke({
        currentProfile,
        message,
        user,
        currentDate: formatForAI(new Date(), user.timezone),
      });

      // Persist via entity service
      if (result.wasUpdated) {
        await fitnessProfileService.saveProfile(userId, result.updatedProfile);
        console.log('[PROFILE_SERVICE] Profile updated:', result.updateSummary);
      } else {
        console.log('[PROFILE_SERVICE] No profile updates detected');
      }

      return {
        response: result.wasUpdated
          ? `Profile updated: ${result.updateSummary}`
          : 'No profile updates detected.',
      };
    } catch (error) {
      console.error('[PROFILE_SERVICE] Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        response: `Profile update failed: ${errorMessage}`,
      };
    }
  }
}
