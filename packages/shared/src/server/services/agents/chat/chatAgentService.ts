/**
 * Chat Agent Service
 *
 * Pure agent layer for chat operations.
 * Handles context building, agent creation, and invocation.
 * No orchestration logic - that belongs in orchestration/chatService.ts.
 */
import type { UserWithProfile } from '@/server/models/user';
import type { Message } from '@/server/models/message';
import { createAgent, AGENTS, type Message as AgentMessage } from '@/server/agents';
import type { ContextService } from '@/server/services/context';
import { ContextType } from '@/server/services/context';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import type { StructuredToolInterface } from '@langchain/core/tools';
import type { AgentDefinitionServiceInstance } from '@/server/services/domain/agents/agentDefinitionService';

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
 * @param agentDefinitionService - AgentDefinitionService for resolving agent definitions
 * @returns ChatAgentServiceInstance
 */
export function createChatAgentService(
  contextService: ContextService,
  agentDefinitionService: AgentDefinitionServiceInstance
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

      // Get resolved definition from agentDefinitionService
      const definition = await agentDefinitionService.getDefinition(AGENTS.CHAT_GENERATE, {
        tools,
      });

      // Create chat agent with resolved definition
      const agent = createAgent(definition);

      // Invoke the chat agent with runtime params
      const result = await agent.invoke({
        message,
        context: agentContext,
        previousMessages: previousMsgs,
      });

      console.log(`[ChatAgentService] Agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      return {
        response: result.response,
        messages: result.messages,
      };
    },
  };
}
