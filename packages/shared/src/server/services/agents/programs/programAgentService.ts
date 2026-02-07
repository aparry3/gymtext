/**
 * Program Agent Service
 *
 * Handles AI operations for parsing raw program text into formatted markdown.
 * Takes raw text (from file parser) and outputs structured workout program markdown.
 */
import { createAgent, AGENTS } from '@/server/agents';
import type { AgentDefinitionServiceInstance } from '../../domain/agents/agentDefinitionService';

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
 * @param agentDefinitionService - AgentDefinitionService for resolving agent definitions
 */
export function createProgramAgentService(
  agentDefinitionService: AgentDefinitionServiceInstance
): ProgramAgentServiceInstance {
  return {
    async parseProgram(rawText: string): Promise<ProgramParseResult> {
      // Get resolved definition and create agent
      const definition = await agentDefinitionService.getDefinition(AGENTS.PROGRAM_PARSE, {
        maxTokens: 32000, // Programs can be lengthy
      });

      const agent = createAgent(definition);

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
