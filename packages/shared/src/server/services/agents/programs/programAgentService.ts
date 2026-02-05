/**
 * Program Agent Service
 *
 * Handles AI operations for parsing raw program text into formatted markdown.
 * Takes raw text (from file parser) and outputs structured workout program markdown.
 */
import { createAgent, PROMPT_IDS, resolveAgentConfig, type AgentServices } from '@/server/agents';

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
 *
 * @param agentServices - AgentServices for fetching agent configs
 */
export function createProgramAgentService(agentServices: AgentServices): ProgramAgentServiceInstance {
  return {
    async parseProgram(rawText: string): Promise<ProgramParseResult> {
      // Fetch config at service layer
      const { systemPrompt, userPrompt: dbUserPrompt, modelConfig } = await resolveAgentConfig(
        PROMPT_IDS.PROGRAM_PARSE,
        agentServices,
        { overrides: { model: 'gpt-5-nano', maxTokens: 32000 } }
      );

      // Create agent with explicit config
      const agent = await createAgent({
        name: PROMPT_IDS.PROGRAM_PARSE,
        systemPrompt,
        dbUserPrompt,
      }, modelConfig);

      console.log('[ProgramAgentService] Invoking with text:', {
        length: rawText.length,
        preview: rawText.slice(0, 500) + (rawText.length > 500 ? '...' : ''),
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
