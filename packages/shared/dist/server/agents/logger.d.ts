import type { Message } from './types';
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
export declare function logAgentInvocation(agentName: string, input: string, messages: Message[], output: unknown): void;
//# sourceMappingURL=logger.d.ts.map