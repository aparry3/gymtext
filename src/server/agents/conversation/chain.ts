import { CHAT_SYSTEM_PROMPT, buildContextMessages, buildLoopContinuationMessage } from '@/server/agents/conversation/prompts';
import { initializeModel, createRunnableAgent } from '../base';
import { ConversationFlowBuilder } from '@/server/services/flows/conversationFlowBuilder';
import { ChatInput, ChatOutput, ChatAgentDeps, ChatAgentConfig, AgentToolResult, AgentLoopState } from './types';

// Re-export types for backward compatibility
export type { ChatAgentDeps, ChatAgentConfig };

const MAX_ITERATIONS = 5;

// Tool execution priority (lower = first)
// Profile updates should happen before modifications so the modification
// has access to the updated profile (e.g., "I hurt my knee, give me upper body")
const TOOL_PRIORITY: Record<string, number> = {
  'update_profile': 1,
  'make_modification': 2,
};

/**
 * Chat Agent Factory (Agentic Loop Pattern)
 *
 * The conversation coordinator that operates in a loop until generating a final response.
 *
 * Architecture:
 * 1. Agent receives user message and context; tools are bound at creation time
 * 2. Agent decides to call a tool or respond
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
export const createChatAgent = ({ tools, onSendMessage, ...config }: ChatAgentConfig) => {
  return createRunnableAgent<ChatInput, ChatOutput>(async (input) => {
    const { user, message, currentWorkout, previousMessages } = input;
    console.log('[CHAT AGENT] Starting agentic loop for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    // Initialize loop state
    const state: AgentLoopState = {
      accumulatedToolMessages: [],
      iteration: 0,
      profileUpdated: false,
    };

    // Track if immediate message was sent this iteration
    let immediateMessageSent = false;

    // Initialize model with tools provided by service
    const model = initializeModel(undefined, config, { tools });

    // Build initial messages
    const systemMessage = { role: 'system', content: CHAT_SYSTEM_PROMPT };

    // Build context messages (date, workout, etc.)
    const contextMessages = buildContextMessages(user.timezone, currentWorkout);

    // Raw user message (no context baked in)
    const userMessage = { role: 'user', content: message };

    // Conversation history for the loop
    // Order: system -> context -> previous messages -> current user message
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory: any[] = [
      systemMessage,
      ...contextMessages,
      ...ConversationFlowBuilder.toMessageArray(previousMessages || []),
      userMessage,
    ];

    // Agentic loop
    while (state.iteration < MAX_ITERATIONS) {
      state.iteration++;
      console.log(`[CHAT AGENT] Iteration ${state.iteration}`);

      // Invoke model
      const result = await model.invoke(conversationHistory);

      // Check for tool calls
      if (result.tool_calls && result.tool_calls.length > 0) {
        // Sort tool calls by priority (profile before modification)
        const sortedToolCalls = [...result.tool_calls].sort(
          (a, b) => (TOOL_PRIORITY[a.name] ?? 99) - (TOOL_PRIORITY[b.name] ?? 99)
        );

        console.log(`[CHAT AGENT] ${sortedToolCalls.length} tool call(s): ${sortedToolCalls.map(tc => tc.name).join(', ')}`);

        // Track messages from tools for this iteration
        const iterationMessages: string[] = [];
        let hasError = false;

        // Reset immediate message flag for this iteration
        immediateMessageSent = false;

        // Execute each tool call in priority order
        for (let i = 0; i < sortedToolCalls.length; i++) {
          const toolCall = sortedToolCalls[i];
          const callId = `call_${state.iteration}_${i}`;

          // Find the tool
          const selectedTool = tools.find(t => t.name === toolCall.name);
          if (!selectedTool) {
            console.error(`[CHAT AGENT] Tool not found: ${toolCall.name}`);
            continue;
          }

          try {
            // Extract message param if present (for immediate acknowledgment)
            const { message: immediateMessage, ...restArgs } = toolCall.args as { message?: string; [key: string]: unknown };

            // Send immediate message if present and callback configured
            if (immediateMessage && onSendMessage) {
              console.log(`[CHAT AGENT] Sending immediate message: ${immediateMessage}`);
              try {
                await onSendMessage(immediateMessage);
                immediateMessageSent = true;

                // Add to conversation history so agent knows it was sent
                conversationHistory.push({
                  role: 'assistant',
                  content: immediateMessage,
                });
              } catch (sendError) {
                console.error(`[CHAT AGENT] Failed to send immediate message:`, sendError);
                // Continue with tool execution even if message send fails
              }
            }

            console.log(`[CHAT AGENT] Executing tool: ${toolCall.name}`);
            const toolResult = await selectedTool.invoke(restArgs) as AgentToolResult;

            // Accumulate messages if present
            if (toolResult.messages && toolResult.messages.length > 0) {
              state.accumulatedToolMessages.push(...toolResult.messages);
              iterationMessages.push(...toolResult.messages);
              console.log(`[CHAT AGENT] Accumulated ${toolResult.messages.length} message(s) from ${toolCall.name}`);
            }

            // Track if profile was updated (for ChatOutput)
            if (toolCall.name === 'update_profile' && toolResult.response.includes('Profile updated')) {
              state.profileUpdated = true;
            }

            // Add tool call to conversation history
            conversationHistory.push({
              role: 'assistant',
              content: '',
              tool_calls: [{
                id: callId,
                type: 'function',
                function: { name: toolCall.name, arguments: JSON.stringify(toolCall.args) },
              }],
            });
            conversationHistory.push({
              role: 'tool',
              content: toolResult.response,
              tool_call_id: callId,
            });

            console.log(`[CHAT AGENT] ${toolCall.name} complete: ${toolResult.response.substring(0, 100)}...`);
          } catch (error) {
            console.error(`[CHAT AGENT] Tool error (${toolCall.name}):`, error);
            state.accumulatedToolMessages.push(
              "I tried to help but encountered an issue. Please try again!"
            );
            hasError = true;
            break;
          }
        }

        if (hasError) {
          break;
        }

        // Add continuation message for next iteration
        conversationHistory.push({
          role: 'user',
          content: buildLoopContinuationMessage(iterationMessages, immediateMessageSent),
        });

        console.log(`[CHAT AGENT] All tools complete, continuing loop`);
        continue;
      }

      // No tool call - this is the final response
      const finalResponse = result.content as string;
      console.log(`[CHAT AGENT] Final response generated after ${state.iteration} iteration(s)`);

      // Return: [final response, ...tool messages]
      const messages = [finalResponse, ...state.accumulatedToolMessages].filter(m => m && m.trim());

      return {
        messages,
        profileUpdated: state.profileUpdated,
      };
    }

    // Safety: max iterations reached
    console.warn(`[CHAT AGENT] Max iterations (${MAX_ITERATIONS}) reached`);

    // Return accumulated messages or fallback
    const messages = state.accumulatedToolMessages.length > 0
      ? state.accumulatedToolMessages
      : ["I'm here to help! What would you like to know about your workout?"];

    return {
      messages,
      profileUpdated: state.profileUpdated,
    };
  });
};
