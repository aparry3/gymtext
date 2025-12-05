import { createRunnableAgent, initializeModel, type AgentConfig } from '../../base';
import type { UserFieldsInput, UserFieldsOutput } from './types';
import { USER_FIELDS_SYSTEM_PROMPT, buildUserFieldsUserMessage } from './prompts';
import { UserFieldsOutputSchema } from './schema';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';

/**
 * Create the User Fields Agent
 *
 * This agent extracts user preference updates from messages:
 * - Timezone (as raw phrase, mapped to IANA later)
 * - Preferred send hour (intelligent time inference)
 * - Name changes
 *
 * Uses gpt-5-nano by default for fast, cheap extraction.
 *
 * @param config - Optional agent configuration (model, temperature, etc.)
 * @returns Agent that extracts user field updates
 */
export function createUserFieldsAgent(config?: AgentConfig) {
  // Initialize model with structured output - default to gpt-5-nano for efficiency
  const model = initializeModel(UserFieldsOutputSchema, {
    model: 'gpt-5-nano',
    temperature: 0.3, // Lower temperature for more deterministic extraction
    ...config,
  });

  return createRunnableAgent<UserFieldsInput, UserFieldsOutput>(
    async (input: UserFieldsInput): Promise<UserFieldsOutput> => {
      try {
        console.log('[USER FIELDS AGENT] Processing message:', {
          messageLength: input.message.length,
          currentTimezone: input.user.timezone,
          currentSendHour: input.user.preferredSendHour,
        });

        // Build the user message with context
        const userMessage = buildUserFieldsUserMessage(
          input.message,
          input.user,
          input.currentDate
        );

        // Invoke the model with system prompt, conversation history, and user message
        const response = await model.invoke([
          { role: 'system', content: USER_FIELDS_SYSTEM_PROMPT },
          ...ConversationFlowBuilder.toMessageArray(input.previousMessages || []),
          { role: 'user', content: userMessage },
        ]);

        console.log('[USER FIELDS AGENT] Extraction completed:', {
          hasUpdates: response.hasUpdates,
          timezonePhrase: response.timezonePhrase,
          preferredSendHour: response.preferredSendHour,
          name: response.name,
          summary: response.updateSummary,
        });

        return {
          timezonePhrase: response.timezonePhrase,
          preferredSendHour: response.preferredSendHour,
          name: response.name,
          hasUpdates: response.hasUpdates,
          updateSummary: response.updateSummary || '',
        };
      } catch (error) {
        console.error('[USER FIELDS AGENT] Error:', error);

        // On error, return no updates
        return {
          timezonePhrase: null,
          preferredSendHour: null,
          name: null,
          hasUpdates: false,
          updateSummary: `Error extracting user fields: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
  );
}

/**
 * Convenience function to invoke the user fields agent
 *
 * @param input - User fields input (message, user, date)
 * @param config - Optional agent configuration
 * @returns Extracted user fields output
 */
export async function extractUserFields(
  input: UserFieldsInput,
  config?: AgentConfig
): Promise<UserFieldsOutput> {
  const agent = createUserFieldsAgent(config);
  return await agent.invoke(input);
}
