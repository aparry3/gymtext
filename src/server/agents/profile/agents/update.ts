import { createAgent, type Message, type ModelConfig } from '../../configurable';
import type { ProfileUpdateInput, ProfileUpdateOutput, StructuredProfileOutput } from '../types';
import { PROFILE_UPDATE_SYSTEM_PROMPT, buildProfileUpdateUserMessage } from '../prompts';
import { ProfileUpdateOutputSchema } from '../schemas';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import { createStructuredProfileAgent } from './structured';

/**
 * Create the Profile Update Agent (Configurable Agent Pattern)
 *
 * This agent maintains the user's fitness profile as a "Living Dossier" in Markdown format.
 * It handles all profile updates, date conversions, and lazy pruning of expired constraints.
 *
 * Uses subAgents pattern to automatically extract structured data when profile is updated.
 *
 * @param config - Optional agent configuration (model, temperature, etc.)
 * @returns Agent that processes profile updates
 */
export const createProfileUpdateAgent = (config?: ModelConfig) => {
  return {
    invoke: async (input: ProfileUpdateInput): Promise<ProfileUpdateOutput> => {
      try {
        console.log('[PROFILE UPDATE AGENT] Processing update:', {
          hasCurrentProfile: !!input.currentProfile,
          messageLength: input.message.length,
          currentDate: input.currentDate,
        });

        // Convert previous messages to Message format for the configurable agent
        const previousMsgs: Message[] = ConversationFlowBuilder.toMessageArray(input.previousMessages || [])
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // Build the user message with all context
        const userPrompt = buildProfileUpdateUserMessage(
          input.currentProfile,
          input.message,
          input.user,
          input.currentDate
        );

        // Create agent with subAgents for structured extraction
        const agent = createAgent({
          name: 'profile-update',
          systemPrompt: PROFILE_UPDATE_SYSTEM_PROMPT,
          previousMessages: previousMsgs,
          schema: ProfileUpdateOutputSchema,
          // SubAgents: structured extraction runs after main agent
          subAgents: [{
            structured: {
              agent: createStructuredProfileAgent(),
              // Only run when profile was updated
              condition: (result: unknown) => (result as { wasUpdated: boolean }).wasUpdated,
              // Pass dossier + currentDate (captured via closure)
              transform: (result: unknown) => JSON.stringify({
                dossierText: (result as { updatedProfile: string }).updatedProfile,
                currentDate: input.currentDate,
              }),
            },
          }],
        }, config);

        // Invoke the agent with the user prompt
        const result = await agent.invoke(userPrompt);

        // Extract structured from subAgent result (typed as StructuredProfileOutput)
        const structuredResult = (result as { structured?: StructuredProfileOutput }).structured;
        const structured = structuredResult?.success ? structuredResult.structured : null;

        console.log('[PROFILE UPDATE AGENT] Update completed:', {
          wasUpdated: result.response.wasUpdated,
          summary: result.response.updateSummary,
          profileLength: result.response.updatedProfile?.length || 0,
          hasStructured: !!structuredResult,
        });

        return {
          updatedProfile: result.response.updatedProfile,
          wasUpdated: result.response.wasUpdated,
          updateSummary: result.response.updateSummary || '',
          structured,
        };
      } catch (error) {
        console.error('[PROFILE UPDATE AGENT] Error:', error);

        // On error, return the original profile unchanged
        return {
          updatedProfile: input.currentProfile,
          wasUpdated: false,
          updateSummary: `Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
          structured: null,
        };
      }
    }
  };
};

/**
 * Convenience function to invoke the profile update agent
 *
 * @param input - Profile update input (current profile, message, user, date)
 * @param config - Optional agent configuration
 * @returns Updated profile output
 */
export async function updateProfile(
  input: ProfileUpdateInput,
  config?: ModelConfig
): Promise<ProfileUpdateOutput> {
  const agent = createProfileUpdateAgent(config);
  return await agent.invoke(input);
}
