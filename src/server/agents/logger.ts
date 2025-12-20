import * as fs from 'fs/promises';
import * as path from 'path';
import type { Message } from './types';

const LOGS_DIR = path.join(process.cwd(), '_logs');

/**
 * Check if agent logging is enabled via environment variable
 */
function isLoggingEnabled(): boolean {
  return process.env.AGENT_LOGGING === 'true';
}

/**
 * Generate a timestamp string for filenames
 * Format: YYYY-MM-DD_HHmmss-mmm (includes milliseconds to avoid collisions)
 */
function generateTimestamp(): string {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
  const ms = now.getMilliseconds().toString().padStart(3, '0');
  return `${date}_${time}-${ms}`;
}

/**
 * Ensure the logs directory exists
 */
async function ensureLogsDir(): Promise<void> {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch {
    // Directory might already exist, ignore
  }
}

/**
 * Format a message for human-readable text output
 */
function formatMessageForText(msg: Message): string {
  const roleLabel = msg.role.toUpperCase();
  const content = msg.content || '';

  // Detect context messages (they start with [CONTEXT:)
  const isContext = msg.role === 'user' && content.startsWith('[CONTEXT:');
  const label = isContext ? `[USER - CONTEXT]` : `[${roleLabel}]`;

  return `${label}\n${content}`;
}

/**
 * Generate human-readable text log content
 */
function generateTextLog(
  agentName: string,
  timestamp: string,
  input: string,
  messages: Message[],
  output: unknown
): string {
  const separator = '='.repeat(80);
  const lines: string[] = [
    separator,
    `AGENT: ${agentName}`,
    `TIMESTAMP: ${timestamp}`,
    `INPUT: ${input}`,
    separator,
    '',
    '--- MESSAGES ARRAY ---',
    '',
  ];

  // Add each message
  messages.forEach((msg) => {
    lines.push(formatMessageForText(msg));
    lines.push('');
  });

  lines.push('--- OUTPUT ---');
  lines.push(typeof output === 'string' ? output : JSON.stringify(output, null, 2));
  lines.push(separator);

  return lines.join('\n');
}

/**
 * Generate JSON log content
 */
function generateJsonLog(
  agentName: string,
  timestamp: string,
  input: string,
  messages: Message[],
  output: unknown
): string {
  return JSON.stringify(
    {
      timestamp,
      agentName,
      input,
      messages,
      output,
    },
    null,
    2
  );
}

/**
 * Log an agent invocation to files
 *
 * This function is fire-and-forget - it does not block agent execution
 * and silently catches any errors to prevent logging from affecting the agent.
 *
 * @param agentName - Name of the agent
 * @param input - Raw input string passed to the agent
 * @param messages - Built messages array (system, context, previous, user)
 * @param output - Agent output (string or structured data)
 */
export function logAgentInvocation(
  agentName: string,
  input: string,
  messages: Message[],
  output: unknown
): void {
  // Skip if logging is disabled
  if (!isLoggingEnabled()) {
    return;
  }

  // Fire-and-forget async logging
  (async () => {
    try {
      await ensureLogsDir();

      const timestamp = generateTimestamp();
      const isoTimestamp = new Date().toISOString();
      const baseFilename = `${agentName}_${timestamp}`;

      // Write both JSON and TXT files in parallel
      await Promise.all([
        fs.writeFile(
          path.join(LOGS_DIR, `${baseFilename}.json`),
          generateJsonLog(agentName, isoTimestamp, input, messages, output),
          'utf-8'
        ),
        fs.writeFile(
          path.join(LOGS_DIR, `${baseFilename}.txt`),
          generateTextLog(agentName, isoTimestamp, input, messages, output),
          'utf-8'
        ),
      ]);
    } catch (error) {
      // Silently ignore logging errors to not affect agent execution
      console.error('[AgentLogger] Failed to write log:', error);
    }
  })();
}
