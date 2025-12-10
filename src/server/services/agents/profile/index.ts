import { userService } from '../../user/userService';
import { fitnessProfileService } from '../../user/fitnessProfileService';
import { workoutInstanceService } from '../../training/workoutInstanceService';
import { createProfileUpdateAgent } from '@/server/agents/profile';
import { createUserFieldsAgent } from '@/server/agents/profile/user';
import { formatForAI, now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import type { ToolResult } from '../shared/types';
import type { Message } from '@/server/models/messageModel';

/**
 * ProfileService - Orchestration service for profile and user field agents
 *
 * Handles profile updates via the profile agent AND user field updates
 * (timezone, send time, name) via the user fields agent.
 * Both agents run in parallel for efficiency.
 *
 * Uses entity services (UserService, FitnessProfileService) for data access.
 *
 * This is an ORCHESTRATION service - it coordinates agent calls.
 * For entity CRUD operations, use FitnessProfileService directly.
 */
export class ProfileService {
  /**
   * Update profile and user fields from a user message
   *
   * Runs both agents in parallel:
   * 1. Profile agent - updates the fitness profile dossier
   * 2. User fields agent - extracts timezone, send time, and name changes
   *
   * Fetches context via entity services, calls both agents,
   * persists updates, and returns a standardized ToolResult.
   *
   * @param userId - The user's ID
   * @param message - The user's message to extract info from
   * @param previousMessages - Optional conversation history for context
   * @returns ToolResult with response summary and optional messages
   */
  static async updateProfile(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult> {
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
      const currentDate = formatForAI(new Date(), user.timezone);

      // Run BOTH agents in parallel for efficiency
      const [profileResult, userFieldsResult] = await Promise.all([
        // Profile agent - updates fitness profile dossier
        createProfileUpdateAgent().invoke({
          currentProfile,
          message,
          user,
          currentDate,
          previousMessages,
        }),
        // User fields agent - extracts timezone, send time, name changes
        createUserFieldsAgent().invoke({
          message,
          user,
          currentDate,
          previousMessages,
        }),
      ]);

      // Persist profile updates
      if (profileResult.wasUpdated) {
        await fitnessProfileService.saveProfile(userId, profileResult.updatedProfile);
        console.log('[PROFILE_SERVICE] Profile updated:', profileResult.updateSummary);
      } else {
        console.log('[PROFILE_SERVICE] No profile updates detected');
      }

      // Handle user field updates
      if (userFieldsResult.hasUpdates) {
        const userUpdates: { preferredSendHour?: number; timezone?: string; name?: string } = {};

        // Timezone: !! handles null and empty string
        if (!!userFieldsResult.timezone) {
          userUpdates.timezone = userFieldsResult.timezone;
          console.log('[PROFILE_SERVICE] Timezone update:', userFieldsResult.timezone);
        }

        // PreferredSendHour: can't use !! because 0 (midnight) is valid
        // Check for null and -1 sentinel explicitly
        if (userFieldsResult.preferredSendHour != null && userFieldsResult.preferredSendHour !== -1) {
          userUpdates.preferredSendHour = userFieldsResult.preferredSendHour;
        }

        // Name: !! handles null and empty string
        if (!!userFieldsResult.name) {
          userUpdates.name = userFieldsResult.name;
        }

        // Persist user updates if any valid fields
        if (Object.keys(userUpdates).length > 0) {
          await userService.updatePreferences(userId, userUpdates);
          console.log('[PROFILE_SERVICE] User fields updated:', userUpdates);

          // Check if time-related fields changed - ensure user has today's workout
          if (userUpdates.timezone !== undefined || userUpdates.preferredSendHour !== undefined) {
            const newTimezone = userUpdates.timezone ?? user.timezone;
            const currentTime = now(newTimezone);

            // Check if workout already exists for today (prevents duplicates)
            const todayStart = currentTime.startOf('day').toJSDate();
            const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, todayStart);

            if (!existingWorkout) {
              // No workout exists - trigger immediate send via Inngest
              await inngest.send({
                name: 'workout/scheduled',
                data: {
                  userId,
                  targetDate: currentTime.startOf('day').toISO(),
                },
              });
              console.log('[PROFILE_SERVICE] Triggered immediate workout for missed send time');
            }
          }
        }
      }

      // Combine summaries for response
      const summaries: string[] = [];
      if (profileResult.wasUpdated) {
        summaries.push(`Profile: ${profileResult.updateSummary}`);
      }
      if (userFieldsResult.hasUpdates && Object.keys(userFieldsResult).some(k =>
        k !== 'hasUpdates' && k !== 'updateSummary' &&
        userFieldsResult[k as keyof typeof userFieldsResult] !== null
      )) {
        summaries.push(`Settings: ${userFieldsResult.updateSummary}`);
      }

      return {
        response: summaries.length > 0
          ? summaries.join('; ')
          : 'No updates detected.',
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
