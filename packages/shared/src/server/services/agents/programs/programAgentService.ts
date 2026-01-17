/**
 * Program Agent Service
 *
 * Handles AI operations for parsing raw program text into formatted markdown.
 * Takes raw text (from file parser) and outputs structured workout program markdown.
 */
import { createAgent, PROMPT_IDS } from '@/server/agents';

/**
 * Result from the program parsing agent
 */
export interface ProgramParseResult {
  response: string; // Formatted markdown
}

/**
 * ProgramAgentServiceInstance interface
 */
export interface ProgramAgentServiceInstance {
  /**
   * Parse raw program text into formatted markdown
   *
   * @param rawText - Raw text extracted from a file (PDF, CSV, XLSX, TXT)
   * @returns Formatted markdown representing the workout program
   */
  parseProgram(rawText: string): Promise<ProgramParseResult>;
}

/**
 * Create a ProgramAgentService instance
 * No dependencies needed - uses createAgent internally with DB-backed prompts
 */
export function createProgramAgentService(): ProgramAgentServiceInstance {
  return {
    async parseProgram(rawText: string): Promise<ProgramParseResult> {
      // Create agent - prompts fetched from DB based on agent name
      const agent = await createAgent({
        name: PROMPT_IDS.PROGRAM_PARSE,
        // No userPrompt override - use DB prompt
      }, {
        model: 'gpt-5-nano',
        maxTokens: 32000, // Programs can be lengthy
      });

      // Invoke with raw text
      const result = await agent.invoke(rawText);

      console.log(`[ProgramAgentService] Parsed program, output length: ${result.response.length}`);

      return {
        response: result.response,
      };
    },
  };
}
