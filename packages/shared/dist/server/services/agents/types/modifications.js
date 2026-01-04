import { z } from 'zod';
/**
 * Schema for modifications agent output
 * Conforms to AgentToolResult pattern for use in agentic loop
 */
export const ModificationsResponseSchema = z.object({
    messages: z.array(z.string()).optional().describe('Optional array of messages to send (e.g., week update message, workout message)'),
    response: z.string().describe('Required context for agent continuation'),
});
