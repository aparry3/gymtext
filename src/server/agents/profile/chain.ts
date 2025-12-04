import { createRunnableAgent, initializeModel, type AgentConfig } from '../base';
import type { ProfileUpdateInput, ProfileUpdateOutput } from './types';
import { PROFILE_UPDATE_SYSTEM_PROMPT, buildProfileUpdateUserMessage } from './prompts';
import { ProfileUpdateOutputSchema } from './schema';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

/**
 * Create the Profile Update Agent
 *
 * This agent maintains the user's fitness profile as a "Living Dossier" in Markdown format.
 * It handles all profile updates, date conversions, and lazy pruning of expired constraints.
 *
 * @param config - Optional agent configuration (model, temperature, etc.)
 * @returns Agent that processes profile updates
 */
export function createProfileUpdateAgent(config?: AgentConfig) {
  // Initialize model with structured output (returns JSON matching ProfileUpdateOutputSchema)
  const model = initializeModel(ProfileUpdateOutputSchema, config);

  return createRunnableAgent<ProfileUpdateInput, ProfileUpdateOutput>(
    async (input: ProfileUpdateInput): Promise<ProfileUpdateOutput> => {
      try {
        console.log('[PROFILE UPDATE AGENT] Processing update:', {
          hasCurrentProfile: !!input.currentProfile,
          messageLength: input.message.length,
          currentDate: input.currentDate,
        });

        // Build the user message with all context
        const userMessage = buildProfileUpdateUserMessage(
          input.currentProfile,
          input.message,
          input.user,
          input.currentDate
        );

        // Invoke the model with system prompt, conversation history, and user message
        const response = await model.invoke([
          { role: 'system', content: PROFILE_UPDATE_SYSTEM_PROMPT },
          ...ConversationFlowBuilder.toMessageArray(input.previousMessages || []),
          { role: 'user', content: userMessage },
        ]);

        console.log('[PROFILE UPDATE AGENT] Update completed:', {
          wasUpdated: response.wasUpdated,
          summary: response.updateSummary,
          profileLength: response.updatedProfile?.length || 0,
        });

        return {
          updatedProfile: response.updatedProfile,
          wasUpdated: response.wasUpdated,
          updateSummary: response.updateSummary || '',
        };
      } catch (error) {
        console.error('[PROFILE UPDATE AGENT] Error:', error);

        // On error, return the original profile unchanged
        return {
          updatedProfile: input.currentProfile,
          wasUpdated: false,
          updateSummary: `Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
  );
}

/**
 * Convenience function to invoke the profile update agent
 *
 * @param input - Profile update input (current profile, message, user, date)
 * @param config - Optional agent configuration
 * @returns Updated profile output
 */
export async function updateProfile(
  input: ProfileUpdateInput,
  config?: AgentConfig
): Promise<ProfileUpdateOutput> {
  const agent = createProfileUpdateAgent(config);
  return await agent.invoke(input);
}
