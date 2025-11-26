import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Check if agent logging is enabled via environment variable
 */
export function isAgentLoggingEnabled(): boolean {
  return process.env.AGENT_LOGGING_ENABLED === 'true';
}

/**
 * Get the root path for agent logs
 */
function getAgentLogsRoot(): string {
  return join(process.cwd(), '_agent_logs');
}

/**
 * Log an agent invocation to files
 *
 * Creates three files in /_agent_logs/{agentPath}/:
 * - system_prompt.txt
 * - user_prompt.txt
 * - output.txt
 *
 * @param params - The logging parameters
 * @param params.agentPath - Path relative to agents dir (e.g., 'training/plans/steps/generation')
 * @param params.systemPrompt - The system prompt sent to the LLM
 * @param params.userPrompt - The user prompt sent to the LLM
 * @param params.output - The LLM response output
 */
export async function logAgentInvocation(params: {
  agentPath: string;
  systemPrompt: string;
  userPrompt: string;
  output: string;
}): Promise<void> {
  if (!isAgentLoggingEnabled()) {
    return;
  }

  const { agentPath, systemPrompt, userPrompt, output } = params;

  try {
    const logDir = join(getAgentLogsRoot(), agentPath);

    // Create directory if it doesn't exist
    await mkdir(logDir, { recursive: true });

    // Write all three files in parallel
    await Promise.all([
      writeFile(join(logDir, 'system_prompt.txt'), systemPrompt, 'utf-8'),
      writeFile(join(logDir, 'user_prompt.txt'), userPrompt, 'utf-8'),
      writeFile(join(logDir, 'output.txt'), output, 'utf-8'),
    ]);
  } catch (error) {
    // Log errors but don't throw - logging should not break agent execution
    console.error('[AGENT LOGGING] Failed to write logs:', error);
  }
}

/**
 * Extract system and user prompts from a LangChain messages array
 *
 * @param messages - Array of message objects with role and content
 * @returns Object with systemPrompt and userPrompt strings
 */
export function extractPromptsFromMessages(
  messages: Array<{ role: string; content: string }>
): { systemPrompt: string; userPrompt: string } {
  let systemPrompt = '';
  let userPrompt = '';

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt += (systemPrompt ? '\n\n' : '') + msg.content;
    } else if (msg.role === 'user') {
      userPrompt += (userPrompt ? '\n\n' : '') + msg.content;
    }
  }

  return { systemPrompt, userPrompt };
}

/**
 * Convert any output to a string for logging
 *
 * @param output - The LLM output (string, object, or other)
 * @returns String representation of the output
 */
export function stringifyOutput(output: unknown): string {
  if (typeof output === 'string') {
    return output;
  }
  if (output === null || output === undefined) {
    return '';
  }
  try {
    return JSON.stringify(output, null, 2);
  } catch {
    return String(output);
  }
}
