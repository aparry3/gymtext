import { createAgent, type ModelConfig } from '../../configurable';
import type { StructuredProfileInput, StructuredProfileOutput } from '../types';
import { STRUCTURED_PROFILE_SYSTEM_PROMPT, buildStructuredProfileUserMessage } from '../prompts';
import { StructuredProfileSchema } from '../schemas';

/**
 * Create the Structured Profile Agent (Configurable Agent Pattern)
 *
 * This agent extracts structured data from a Markdown profile dossier.
 * It converts the free-form Markdown into a typed JSON structure that can be
 * easily queried, displayed in UI, or used by other systems.
 *
 * Uses gpt-5-nano by default for fast, efficient extraction.
 *
 * @param config - Optional agent configuration (model, temperature, etc.)
 * @returns Agent that extracts structured profile data
 */
export const createStructuredProfileAgent = (config?: ModelConfig) => {
  return {
    invoke: async (input: StructuredProfileInput): Promise<StructuredProfileOutput> => {
      try {
        console.log('[STRUCTURED PROFILE AGENT] Parsing dossier:', {
          dossierLength: input.dossierText.length,
          currentDate: input.currentDate,
        });

        // Build the user message
        const userPrompt = buildStructuredProfileUserMessage(
          input.dossierText,
          input.currentDate
        );

        // Create agent with configurable agent factory
        // Default to gpt-5-nano with low temperature for deterministic extraction
        const agent = createAgent({
          name: 'structured-profile',
          systemPrompt: STRUCTURED_PROFILE_SYSTEM_PROMPT,
          schema: StructuredProfileSchema,
        }, {
          model: 'gpt-5-nano',
          temperature: 0.3,
          ...config,
        });

        // Invoke the agent with the user prompt
        const result = await agent.invoke(userPrompt);

        console.log('[STRUCTURED PROFILE AGENT] Extraction completed:', {
          goalsCount: result.response.goals.length,
          preferencesCount: result.response.preferences.length,
          injuriesCount: result.response.injuries.length,
          constraintsCount: result.response.constraints.length,
          experienceLevel: result.response.experienceLevel,
        });

        return {
          structured: result.response,
          success: true,
        };
      } catch (error) {
        console.error('[STRUCTURED PROFILE AGENT] Error:', error);

        // Return empty structured profile on error
        return {
          structured: {
            goals: [],
            experienceLevel: null,
            preferences: [],
            injuries: [],
            constraints: [],
            equipmentAccess: [],
          },
          success: false,
          notes: `Error extracting structured profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    }
  };
};

/**
 * Convenience function to invoke the structured profile agent
 *
 * @param input - Structured profile input (dossier text, current date)
 * @param config - Optional agent configuration
 * @returns Extracted structured profile output
 */
export async function extractStructuredProfile(
  input: StructuredProfileInput,
  config?: ModelConfig
): Promise<StructuredProfileOutput> {
  const agent = createStructuredProfileAgent(config);
  return await agent.invoke(input);
}
