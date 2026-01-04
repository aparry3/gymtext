import { type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolResult } from '../types/shared';
import type { Message } from '@/server/models/message';
/**
 * Creates a tool with a required `message` parameter that gets sent immediately
 * before the callback executes. This allows the LLM to provide an acknowledgment
 * message while slow tools are processing.
 *
 * @param name - Tool name
 * @param description - Tool description for the LLM
 * @param callback - The async function to execute
 * @param onSendMessage - Callback to send the immediate message
 * @returns StructuredToolInterface with message handling built-in
 */
export declare function toolWithMessage(name: string, description: string, callback: () => Promise<ToolResult>, onSendMessage: (message: string) => Promise<void>): StructuredToolInterface;
/**
 * Dependencies for chat tools (DI pattern)
 * Pass the methods directly, not the full services
 */
export interface ChatToolDeps {
    makeModification: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
    getWorkout: (userId: string, timezone: string) => Promise<ToolResult>;
    updateProfile: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
}
/**
 * Context required for chat tools
 */
export interface ChatToolContext {
    userId: string;
    message: string;
    previousMessages?: Message[];
    timezone: string;
}
/**
 * Factory function to create chat tools with injected dependencies
 *
 * Creates tools that the chat agent can use:
 * - update_profile: Record permanent user preferences and profile information (Priority 1)
 * - get_workout: Get or generate today's workout (Priority 2)
 * - make_modification: Make changes to workouts, schedules, or plans (Priority 3)
 *
 * All tools return standardized ToolResult: { response: string, messages?: string[] }
 *
 * @param context - Context from chat (userId, message)
 * @param deps - Dependencies (updateProfile, makeModification, getWorkout methods)
 * @returns Array of LangChain tools
 */
export declare const createChatTools: (context: ChatToolContext, deps: ChatToolDeps, onSendMessage: (message: string) => Promise<void>) => StructuredToolInterface[];
//# sourceMappingURL=tools.d.ts.map