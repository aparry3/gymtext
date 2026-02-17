import { formatForAI, now } from '@/shared/utils/date';
import { inngest } from '@/server/connections/inngest/client';
import {
  buildUserFieldsUserMessage,
} from '../prompts/profile';
import type { UserFieldsOutput } from '../types/profile';
import type { CommonTimezone } from '@/shared/utils/timezone';
import type { ToolResult } from '../types/shared';
import type { Message } from '@/server/models/message';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { WorkoutInstanceServiceInstance } from '../../domain/training/workoutInstanceService';
import type { DossierServiceInstance } from '../../domain/dossier/dossierService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

/**
 * ProfileServiceInstance interface
 */
export interface ProfileServiceInstance {
  updateProfile(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult>;
}

export interface ProfileServiceDeps {
  user: UserServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  dossier: DossierServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
}

/**
 * Create a ProfileService instance with injected dependencies
 *
 * ProfileService - Orchestration service for profile updates
 *
 * Handles profile updates via the profile:update agent (dossier-based)
 * and user field updates (timezone, send time, name) via profile:user agent.
 * Both agents run in parallel for efficiency.
 */
export function createProfileService(deps: ProfileServiceDeps): ProfileServiceInstance {
  const { user: userService, workoutInstance: workoutInstanceService, dossier: dossierService, agentRunner: simpleAgentRunner } = deps;

  return {
    async updateProfile(userId: string, message: string, previousMessages?: Message[]): Promise<ToolResult> {
      console.log('[PROFILE_SERVICE] Processing profile update:', {
        userId,
        message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      });

      try {
        const user = await userService.getUser(userId);
        if (!user) {
          console.warn('[PROFILE_SERVICE] User not found:', userId);
          return { toolType: 'action', response: 'User not found.' };
        }

        // Fetch current profile dossier
        const currentProfile = await dossierService.getProfile(userId) ?? '';
        const currentDate = formatForAI(new Date(), user.timezone);

        // Convert previous messages to agent format
        const previousMsgs = (previousMessages || []).map(m => ({
          role: m.direction === 'inbound' ? 'user' as const : 'assistant' as const,
          content: m.content,
        }));

        // Run profile update + user fields agents in parallel
        const [profileAgentResult, userFieldsAgentResult] = await Promise.all([
          // Profile agent - updates fitness profile dossier via simpleAgentRunner
          simpleAgentRunner.invoke('profile:update', {
            input: message,
            context: currentProfile ? [`<Profile>${currentProfile}</Profile>`] : [],
            params: { user, currentDate },
            previousMessages: previousMsgs,
          }),
          // User fields agent - extracts timezone, send time, name changes
          simpleAgentRunner.invoke('profile:user', {
            input: buildUserFieldsUserMessage(message, user, currentDate),
            params: { user },
            previousMessages: previousMsgs,
          }),
        ]);

        // Profile update: the agent returns updated markdown
        const updatedProfile = profileAgentResult.response;
        const profileWasUpdated = updatedProfile && updatedProfile !== currentProfile;

        // User fields result - parse JSON string from simple runner
        let userFieldsResponse: Record<string, unknown>;
        try {
          userFieldsResponse = typeof userFieldsAgentResult.response === 'string'
            ? JSON.parse(userFieldsAgentResult.response)
            : userFieldsAgentResult.response as Record<string, unknown>;
        } catch {
          console.warn('[PROFILE_SERVICE] Could not parse user fields response, skipping user field updates');
          userFieldsResponse = { hasUpdates: false };
        }
        const userFieldsResult: UserFieldsOutput = {
          timezone: (userFieldsResponse.timezone as CommonTimezone | null) ?? null,
          preferredSendHour: (userFieldsResponse.preferredSendHour as number | null) ?? null,
          name: (userFieldsResponse.name as string | null) ?? null,
          hasUpdates: userFieldsResponse.hasUpdates as boolean,
          updateSummary: (userFieldsResponse.updateSummary as string) || '',
        };

        // Persist profile update via dossier service
        if (profileWasUpdated) {
          await dossierService.updateProfile(userId, updatedProfile);
          console.log('[PROFILE_SERVICE] Profile dossier updated');
        } else {
          console.log('[PROFILE_SERVICE] No profile updates detected');
        }

        // Handle user field updates
        if (userFieldsResult.hasUpdates) {
          const userUpdates: { preferredSendHour?: number; timezone?: string; name?: string } = {};

          if (!!userFieldsResult.timezone) {
            userUpdates.timezone = userFieldsResult.timezone;
            console.log('[PROFILE_SERVICE] Timezone update:', userFieldsResult.timezone);
          }

          if (userFieldsResult.preferredSendHour != null && userFieldsResult.preferredSendHour !== -1) {
            userUpdates.preferredSendHour = userFieldsResult.preferredSendHour;
          }

          if (!!userFieldsResult.name) {
            userUpdates.name = userFieldsResult.name;
          }

          if (Object.keys(userUpdates).length > 0) {
            await userService.updatePreferences(userId, userUpdates);
            console.log('[PROFILE_SERVICE] User fields updated:', userUpdates);

            if (userUpdates.timezone !== undefined || userUpdates.preferredSendHour !== undefined) {
              const newTimezone = userUpdates.timezone ?? user.timezone;
              const currentTime = now(newTimezone);
              const todayStart = currentTime.startOf('day').toJSDate();
              const existingWorkout = await workoutInstanceService.getWorkoutByUserIdAndDate(userId, todayStart);

              if (!existingWorkout) {
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
        if (profileWasUpdated) {
          summaries.push('Profile updated');
        }
        if (userFieldsResult.hasUpdates && userFieldsResult.updateSummary) {
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
    },
  };
}
