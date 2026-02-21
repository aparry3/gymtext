/**
 * Program Agent Service
 *
 * Handles AI operations for parsing raw program text into formatted markdown.
 * Takes raw text (from file parser) and outputs structured workout program markdown.
 */
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

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
 * @param agentRunner - AgentRunner for invoking agents
 */
export function createProgramAgentService(
  agentRunner: SimpleAgentRunnerInstance
): ProgramAgentServiceInstance {
  return {
    async parseProgram(rawText: string): Promise<ProgramParseResult> {
      console.log('[ProgramAgentService] Invoking with text:', {
        length: rawText.length,
        preview: rawText.slice(0, 500) + (rawText.length > 500 ? '...' : ''),
      });

      const result = await agentRunner.invoke('program:parse', {
        input: rawText,
      });

      const response = result.response as string;
      console.log(`[ProgramAgentService] Parsed program, output length: ${response.length}`);

      return { response };
    },
  };
}
