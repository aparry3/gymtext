/**
 * Chat Agent Service
 *
 * Pure agent layer for chat operations.
 * Handles context building, agent creation, and invocation.
 * No orchestration logic - that belongs in orchestration/chatService.ts.
 *
 * Supports two patterns:
 * 1. Legacy: Tools passed directly via generateResponse()
 * 2. Registry: Tools resolved from ToolRegistry via generateResponseFromRegistry()
 */
import type { UserWithProfile } from '@/server/models/user';
import type { Message } from '@/server/models/message';
import {
  createAgent,
  PROMPT_IDS,
  createAgentFromRegistry,
  executeAgentCallbacks,
  initializeRegistries,
  type Message as AgentMessage,
  type ToolContext,
} from '@/server/agents';
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
   * Generate a response to a user message (legacy pattern - tools passed in)
   */
  generateResponse(
    user: UserWithProfile,
    message: string,
    previousMessages: Message[],
    tools: StructuredToolInterface[]
  ): Promise<ChatAgentResult>;

  /**
   * Generate a response using the registry pattern.
   * Tools are resolved from ToolRegistry, callbacks run automatically.
   */
  generateResponseFromRegistry(
    user: UserWithProfile,
    message: string,
    previousMessages: Message[],
    toolContext: ToolContext
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
  /**
   * Build agent context and convert messages (shared between both patterns)
   */
  const prepareAgentInputs = async (
    user: UserWithProfile,
    previousMessages: Message[]
  ) => {
    const agentContext = await contextService.getContext(
      user,
      [ContextType.DATE_CONTEXT, ContextType.CURRENT_WORKOUT]
    );

    const previousMsgs: AgentMessage[] = ConversationFlowBuilder.toMessageArray(previousMessages || [])
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    return { agentContext, previousMsgs };
  };

  return {
    /**
     * Legacy pattern: tools created externally and passed in
     */
    async generateResponse(
      user: UserWithProfile,
      message: string,
      previousMessages: Message[],
      tools: StructuredToolInterface[]
    ): Promise<ChatAgentResult> {
      const { agentContext, previousMsgs } = await prepareAgentInputs(user, previousMessages);

      const agent = await createAgent({
        name: PROMPT_IDS.CHAT_GENERATE,
        context: agentContext,
        previousMessages: previousMsgs,
        tools,
      });

      const result = await agent.invoke(message);

      console.log(`[ChatAgentService] Agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      return {
        response: result.response,
        messages: result.messages,
      };
    },

    /**
     * Registry pattern: tools resolved from ToolRegistry, callbacks run automatically
     */
    async generateResponseFromRegistry(
      user: UserWithProfile,
      message: string,
      previousMessages: Message[],
      toolContext: ToolContext
    ): Promise<ChatAgentResult> {
      // Ensure registries are initialized
      initializeRegistries();

      const { agentContext, previousMsgs } = await prepareAgentInputs(user, previousMessages);

      // Create agent from registry - tools resolved by name
      const { agent, callbacks } = await createAgentFromRegistry<ChatAgentResult>(
        PROMPT_IDS.CHAT_GENERATE,
        {
          context: agentContext,
          previousMessages: previousMsgs,
          toolContext,
        }
      );

      const result = await agent.invoke(message);

      console.log(`[ChatAgentService] Registry agent completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      // Execute deterministic callbacks (e.g., SMS length enforcement)
      await executeAgentCallbacks(
        callbacks,
        result,
        { userId: toolContext.userId },
        true
      );

      return {
        response: result.response,
        messages: result.messages,
      };
    },
  };
}
