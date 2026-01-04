import { UserWithProfile } from '@/server/models/user';
/**
 * ChatService handles incoming SMS messages and generates AI-powered responses.
 *
 * This service orchestrates the chat agent which operates in an agentic loop:
 * - Agent decides when to call tools (update_profile, make_modification, get_workout)
 * - Tool priority ensures update_profile runs first when called with other tools
 * - Agent generates a final conversational response
 * - Tool messages are accumulated and sent after the agent's response
 *
 * The service ensures that:
 * - Agent autonomously decides when profile updates are needed
 * - Modifications happen when the agent decides to call make_modification
 * - Conversation history and context are properly maintained
 * - SMS length constraints are enforced
 */
export declare class ChatService {
    /**
     * Processes pending inbound SMS messages using the two-agent architecture.
     *
     * @param user - The user object with their profile information
     * @returns A promise that resolves to an array of response messages (empty if no pending messages)
     *
     * @remarks
     * This method performs a single DB fetch and splits messages into:
     * - pending: inbound messages after the last outbound (to be processed)
     * - context: conversation history up to and including the last outbound
     *
     * This architecture ensures:
     * - No race conditions from multiple DB fetches
     * - Profile information is always current
     * - Proper acknowledgment of profile updates in responses
     * - Support for multiple messages (e.g., week update + workout message)
     *
     * @example
     * ```typescript
     * const messages = await ChatService.handleIncomingMessage(user);
     * // Returns [] if no pending messages, otherwise generates responses
     * ```
     */
    static handleIncomingMessage(user: UserWithProfile): Promise<string[]>;
}
export { createChatTools } from './tools';
export type { ChatToolContext, ChatToolDeps } from './tools';
//# sourceMappingURL=index.d.ts.map