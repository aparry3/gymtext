import { userService } from '../../user/userService';
import { fitnessProfileService } from '../../user/fitnessProfileService';
import { workoutInstanceService } from '../../training/workoutInstanceService';
import { createAgent, type Message as AgentMessage } from '@/server/agents';
import { formatForAI, now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import {
  buildProfileUpdateUserMessage,
  buildUserFieldsUserMessage,
  buildStructuredProfileUserMessage,
} from '../prompts/profile';
import {
  ProfileUpdateOutputSchema,
  UserFieldsOutputSchema,
} from '../schemas/profile';
import { StructuredProfileSchema } from '@/server/models/profile';
import type { StructuredProfileOutput, ProfileUpdateOutput, UserFieldsOutput, StructuredProfileInput } from '../types/profile';
import type { ToolResult } from '../types/shared';
import type { Message } from '@/server/models/message';

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
        return { toolType: 'action', response: 'User not found.' };
      }

      const currentProfile = await fitnessProfileService.getCurrentProfile(userId) ?? '';
      const currentDate = formatForAI(new Date(), user.timezone);

      // Convert previous messages to Message format for the configurable agent
      const previousMsgs: AgentMessage[] = ConversationFlowBuilder.toMessageArray(previousMessages || [])
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Helper function to create and invoke the structured profile agent
      // System prompt fetched from DB based on agent name
      const invokeStructuredProfileAgent = async (input: StructuredProfileInput | string): Promise<StructuredProfileOutput> => {
        const parsedInput: StructuredProfileInput = typeof input === 'string' ? JSON.parse(input) : input;
        const userPrompt = buildStructuredProfileUserMessage(parsedInput.dossierText, parsedInput.currentDate);
        const agent = await createAgent({
          name: 'profile:structured',
          schema: StructuredProfileSchema,
        }, { model: 'gpt-5-nano', temperature: 0.3 });

        const result = await agent.invoke(userPrompt);
        return { structured: result.response, success: true };
      };

      // Run BOTH agents in parallel for efficiency
      const [profileResult, userFieldsResult] = await Promise.all([
        // Profile agent - updates fitness profile dossier
        // Prompts fetched from DB based on agent name
        (async (): Promise<ProfileUpdateOutput> => {
          const userPrompt = buildProfileUpdateUserMessage(currentProfile, message, user, currentDate);

          // Create profile update agent with subAgents for structured extraction
          const agent = await createAgent({
            name: 'profile:fitness',
            previousMessages: previousMsgs,
            schema: ProfileUpdateOutputSchema,
            subAgents: [{
              structured: {
                agent: { name: 'profile:structured', invoke: invokeStructuredProfileAgent },
                condition: (result: unknown) => (result as { wasUpdated: boolean }).wasUpdated,
                transform: (result: unknown) => JSON.stringify({
                  dossierText: (result as { updatedProfile: string }).updatedProfile,
                  currentDate,
                }),
              },
            }],
          });

          const result = await agent.invoke(userPrompt);
          const structuredResult = (result as { structured?: StructuredProfileOutput }).structured;
          const structured = structuredResult?.success ? structuredResult.structured : null;

          return {
            updatedProfile: result.response.updatedProfile,
            wasUpdated: result.response.wasUpdated,
            updateSummary: result.response.updateSummary || '',
            structured,
          };
        })(),
        // User fields agent - extracts timezone, send time, name changes
        // Prompts fetched from DB based on agent name
        (async (): Promise<UserFieldsOutput> => {
          const userPrompt = buildUserFieldsUserMessage(message, user, currentDate);
          const agent = await createAgent({
            name: 'profile:user',
            previousMessages: previousMsgs,
            schema: UserFieldsOutputSchema,
          }, { model: 'gpt-5-nano', temperature: 0.3 });

          const result = await agent.invoke(userPrompt);
          return {
            timezone: result.response.timezone,
            preferredSendHour: result.response.preferredSendHour,
            name: result.response.name,
            hasUpdates: result.response.hasUpdates,
            updateSummary: result.response.updateSummary || '',
          };
        })(),
      ]);

      // Persist profile updates (structured data now included from update agent)
      if (profileResult.wasUpdated) {
        await fitnessProfileService.saveProfileWithStructured(
          userId,
          profileResult.updatedProfile,
          profileResult.structured
        );

        console.log('[PROFILE_SERVICE] Profile updated:', {
          summary: profileResult.updateSummary,
          hasStructured: profileResult.structured !== null,
        });
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
        toolType: 'action',
        response: summaries.length > 0
          ? summaries.join('; ')
          : 'No updates detected.',
      };
    } catch (error) {
      console.error('[PROFILE_SERVICE] Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        toolType: 'action',
        response: `Profile update failed: ${errorMessage}`,
      };
    }
  }
}
