/**
 * Chat Agent Service
 *
 * Pure agent layer for chat operations.
 * Handles context building, agent creation, and invocation.
 * No orchestration logic - that belongs in orchestration/chatService.ts.
 */
import type { UserWithProfile } from '@/server/models/user';
import type { Message } from '@/server/models/message';
import { createAgent, PROMPT_IDS, type Message as AgentMessage } from '@/server/agents';
import type { ContextService } from '@/server/services/context';
import { ContextType } from '@/server/services/context';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import type { StructuredToolInterface } from '@langchain/core/tools';

/**
 * Result from the chat agent
 */
export interface ChatAgentResult {
  response: string;
  messages?: string[];
}

/**
 * ChatAgentServiceInstance interface
 */
export interface ChatAgentServiceInstance {
  /**
   * Generate a response to a user message
   *
   * @param user - User with profile
   * @param message - Aggregated user message content
   * @param previousMessages - Conversation history for context
   * @param tools - Tools for the agent to use
   * @returns Agent result with response and optional messages
   */
  generateResponse(
    user: UserWithProfile,
    message: string,
    previousMessages: Message[],
    tools: StructuredToolInterface[]
  ): Promise<ChatAgentResult>;
}

/**
 * Create a ChatAgentService instance
 *
 * @param contextService - ContextService for building agent context
 * @returns ChatAgentServiceInstance
 */
export function createChatAgentService(
  contextService: ContextService
): ChatAgentServiceInstance {
  return {
    async generateResponse(
      user: UserWithProfile,
      message: string,
      previousMessages: Message[],
      tools: StructuredToolInterface[]
    ): Promise<ChatAgentResult> {
      // Build context using ContextService
      const agentContext = await contextService.getContext(
        user,
        [ContextType.DATE_CONTEXT, ContextType.CURRENT_WORKOUT]
      );

      // Convert previous messages to Message format for the configurable agent
      const previousMsgs: AgentMessage[] = ConversationFlowBuilder.toMessageArray(previousMessages || [])
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Create chat agent - prompts fetched from DB based on agent name
      const agent = await createAgent({
        name: PROMPT_IDS.CHAT_GENERATE,
        context: agentContext,
        previousMessages: previousMsgs,
        tools,
      });

      // Invoke the chat agent - it will decide when to call tools
      const result = await agent.invoke(message);

      console.log(`[ChatAgentService] Agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      return {
        response: result.response,
        messages: result.messages,
      };
    },
  };
}
