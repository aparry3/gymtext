import { createAgent, type Message, type ModelConfig } from '../../configurable';
import type { UserFieldsInput, UserFieldsOutput } from '../types';
import { USER_FIELDS_SYSTEM_PROMPT, buildUserFieldsUserMessage } from '../prompts';
import { UserFieldsOutputSchema } from '../schemas';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

/**
 * Create the User Fields Agent (Configurable Agent Pattern)
 *
 * This agent extracts user preference updates from messages:
 * - Timezone (IANA format from constrained enum)
 * - Preferred send hour (intelligent time inference)
 * - Name changes
 *
 * Uses gpt-5-nano by default for fast, cheap extraction.
 *
 * @param config - Optional agent configuration (model, temperature, etc.)
 * @returns Agent that extracts user field updates
 */
export const createUserFieldsAgent = (config?: ModelConfig) => {
  return {
    invoke: async (input: UserFieldsInput): Promise<UserFieldsOutput> => {
      try {
        console.log('[USER FIELDS AGENT] Processing message:', {
          messageLength: input.message.length,
          currentTimezone: input.user.timezone,
          currentSendHour: input.user.preferredSendHour,
        });

        // Convert previous messages to Message format for the configurable agent
        const previousMsgs: Message[] = ConversationFlowBuilder.toMessageArray(input.previousMessages || [])
          .map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          }));

        // Build the user message with context
        const userPrompt = buildUserFieldsUserMessage(
          input.message,
          input.user,
          input.currentDate
        );

        // Create agent with configurable agent factory
        // Default to gpt-5-nano with low temperature for deterministic extraction
        const agent = createAgent({
          name: 'user-fields',
          systemPrompt: USER_FIELDS_SYSTEM_PROMPT,
          previousMessages: previousMsgs,
          schema: UserFieldsOutputSchema,
        }, {
          model: 'gpt-5-nano',
          temperature: 0.3,
          ...config,
        });

        // Invoke the agent with the user prompt
        const result = await agent.invoke(userPrompt);

        console.log('[USER FIELDS AGENT] Extraction completed:', {
          hasUpdates: result.response.hasUpdates,
          timezone: result.response.timezone,
          preferredSendHour: result.response.preferredSendHour,
          name: result.response.name,
          summary: result.response.updateSummary,
        });

        return {
          timezone: result.response.timezone,
          preferredSendHour: result.response.preferredSendHour,
          name: result.response.name,
          hasUpdates: result.response.hasUpdates,
          updateSummary: result.response.updateSummary || '',
        };
      } catch (error) {
        console.error('[USER FIELDS AGENT] Error:', error);

        // On error, return no updates
        return {
          timezone: null,
          preferredSendHour: null,
          name: null,
          hasUpdates: false,
          updateSummary: `Error extracting user fields: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
  };
};

/**
 * Convenience function to invoke the user fields agent
 *
 * @param input - User fields input (message, user, date)
 * @param config - Optional agent configuration
 * @returns Extracted user fields output
 */
export async function extractUserFields(
  input: UserFieldsInput,
  config?: ModelConfig
): Promise<UserFieldsOutput> {
  const agent = createUserFieldsAgent(config);
  return await agent.invoke(input);
}
