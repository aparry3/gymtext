import { CHAT_SYSTEM_PROMPT, buildContextMessages } from '@/server/agents/conversation/prompts';
import { createAgent, type Message } from '@/server/agents/configurable';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import { ChatInput, ChatOutput, ChatAgentDeps, ChatAgentConfig } from './types';

// Re-export types for backward compatibility
export type { ChatAgentDeps, ChatAgentConfig };

/**
 * Chat Agent Factory (Configurable Agent Pattern)
 *
 * The conversation coordinator that uses the configurable agent architecture
 * with tool-based agentic loop.
 *
 * Architecture:
 * 1. Agent receives user message and context; tools are bound at creation time
 * 2. Agent decides to call a tool or respond via executeToolLoop
 * 3. If tool called: execute, accumulate messages, append response to context, continue loop
 * 4. If no tool: generate final response, exit loop
 * 5. Return [final response, ...accumulated tool messages]
 *
 * Tools are provided by the calling service (ChatService) via config, not created here.
 * This keeps the agent focused on orchestration, not tool creation.
 *
 * @param config - Agent configuration including tools
 * @returns Agent that processes chat messages
 */
export const createChatAgent = ({ tools, ...config }: ChatAgentConfig) => {
  return {
    invoke: async (input: ChatInput): Promise<ChatOutput> => {
      const { user, message, currentWorkout, previousMessages, profileUpdateResult } = input;
      console.log('[CHAT AGENT] Starting with configurable agent for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

      // Build context strings from context messages
      const contextMessages = buildContextMessages(user.timezone, currentWorkout);
      const context: string[] = contextMessages.map(m => m.content);

      // Add profile update context if present (profile was updated before agent ran)
      if (profileUpdateResult) {
        context.push(`[CONTEXT: PROFILE UPDATE]
Profile was just updated: ${profileUpdateResult}
Acknowledge this update naturally in your response.`);
      }

      // Convert previous messages to Message format for the configurable agent
      const previousMsgs: Message[] = ConversationFlowBuilder.toMessageArray(previousMessages || [])
        .map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Create agent with configurable agent factory
      const agent = createAgent({
        name: 'conversation',
        systemPrompt: CHAT_SYSTEM_PROMPT,
        context,
        previousMessages: previousMsgs,
        tools,
      }, config);

      // Invoke the agent with the user's message
      const result = await agent.invoke(message);

      console.log(`[CHAT AGENT] Completed with response length: ${result.response.length}, accumulated messages: ${result.messages?.length || 0}`);

      // Map to ChatOutput format
      // Order: [agent's final response, ...accumulated tool messages]
      const messages = [result.response, ...(result.messages || [])].filter(m => m && m.trim());

      return {
        messages,
        profileUpdated: !!profileUpdateResult,
      };
    }
  };
};
