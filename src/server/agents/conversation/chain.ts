import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { CHAT_SYSTEM_PROMPT, buildChatUserMessage, buildLoopContinuationMessage } from '@/server/agents/conversation/prompts';
import { initializeModel, createRunnableAgent } from '../base';
import { createProfileUpdateAgent } from '../profile';
import { ChatInput, ChatOutput, ChatAgentDeps, AgentToolResult, AgentLoopState } from './types';
import { formatForAI, now, getWeekday, DAY_NAMES } from '@/shared/utils/date';

// Re-export types for backward compatibility
export type { ChatAgentDeps };

const MAX_ITERATIONS = 5;

/**
 * Chat Agent Factory (Agentic Loop Pattern)
 *
 * The conversation coordinator that operates in a loop until generating a final response.
 *
 * Architecture:
 * 1. Agent receives user message and context
 * 2. Agent decides to call a tool or respond
 * 3. If tool called: execute, accumulate messages, append response to context, continue loop
 * 4. If no tool: generate final response, exit loop
 * 5. Return [final response, ...accumulated tool messages]
 *
 * Tools:
 * - `update_profile`: Record fitness information (PRs, injuries, goals)
 * - `make_modification`: Make workout/schedule/program changes
 *
 * @param deps - Dependencies injected by the service
 * @returns Agent that processes chat messages
 */
export const createChatAgent = (deps: ChatAgentDeps) => {
  return createRunnableAgent<ChatInput, ChatOutput>(async (input) => {
    const { user, message, previousMessages, currentWorkout } = input;
    console.log('[CHAT AGENT] Starting agentic loop for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    // Initialize loop state
    const state: AgentLoopState = {
      accumulatedToolMessages: [],
      context: '',
      iteration: 0,
      profileUpdated: false,
    };

    // Calculate context for modifications
    const today = now(user.timezone).toJSDate();
    const weekday = getWeekday(today, user.timezone);
    const targetDay = DAY_NAMES[weekday - 1];

    // Create the update_profile tool
    const updateProfileTool = tool(
      async (): Promise<AgentToolResult> => {
        const currentProfile = user.profile || '';
        const profileAgent = createProfileUpdateAgent();
        const result = await profileAgent.invoke({
          currentProfile,
          message,
          user,
          currentDate: formatForAI(new Date(), user.timezone),
        });

        // Save profile if updated
        if (result.wasUpdated) {
          await deps.saveProfile(user.id, result.updatedProfile);
          state.profileUpdated = true;
          console.log('[CHAT AGENT] Profile updated and saved:', result.updateSummary);
        }

        return {
          response: result.wasUpdated
            ? `Profile updated: ${result.updateSummary}`
            : 'No profile updates detected from the message.',
        };
      },
      {
        name: 'update_profile',
        description: `Record fitness information from the user's message to their profile.

Use this tool when the user shares:
- Personal records (PRs) or achievements
- Injuries or physical limitations
- Goals or preferences
- Equipment or gym access changes
- Schedule or availability changes

The tool will analyze the message and update their fitness profile accordingly.
All context is automatically provided - no parameters needed.`,
        schema: z.object({}),
      }
    );

    // Create the make_modification tool
    const makeModificationTool = tool(
      async (): Promise<AgentToolResult> => {
        const result = await deps.makeModification({
          user,
          message,
          previousMessages,
          currentWorkout,
          workoutDate: today,
          targetDay,
        });

        return {
          messages: result.messages,
          response: result.response,
        };
      },
      {
        name: 'make_modification',
        description: `Make changes to the user's workout, weekly schedule, or training plan.

Use this tool when the user wants to:
- Change today's workout (swap exercises, different constraints, different equipment)
- Get a different workout type or muscle group than scheduled
- Modify their weekly training schedule
- Make program-level changes (frequency, training splits, overall focus)

This tool handles ALL modification requests. It will internally determine the appropriate type of change needed.
All context (user, message, date, etc.) is automatically provided - no parameters needed.`,
        schema: z.object({}),
      }
    );

    const tools = [updateProfileTool, makeModificationTool];

    // Initialize model with tools
    const model = initializeModel(undefined, deps.config, { tools });

    // Build initial messages
    const systemMessage = { role: 'system', content: CHAT_SYSTEM_PROMPT };
    const initialUserMessage = {
      role: 'user',
      content: buildChatUserMessage(message, user.timezone, currentWorkout),
    };

    // Conversation history for the loop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conversationHistory: any[] = [systemMessage, initialUserMessage];

    // Agentic loop
    while (state.iteration < MAX_ITERATIONS) {
      state.iteration++;
      console.log(`[CHAT AGENT] Iteration ${state.iteration}`);

      // Invoke model
      const result = await model.invoke(conversationHistory);

      // Check for tool calls
      if (result.tool_calls && result.tool_calls.length > 0) {
        const toolCall = result.tool_calls[0];
        console.log(`[CHAT AGENT] Tool call: ${toolCall.name}`);

        // Find and execute the tool
        const selectedTool = tools.find(t => t.name === toolCall.name);
        if (!selectedTool) {
          console.error(`[CHAT AGENT] Tool not found: ${toolCall.name}`);
          break;
        }

        try {
          const toolResult = await selectedTool.invoke(toolCall.args) as AgentToolResult;

          // Accumulate messages if present
          if (toolResult.messages && toolResult.messages.length > 0) {
            state.accumulatedToolMessages.push(...toolResult.messages);
            console.log(`[CHAT AGENT] Accumulated ${toolResult.messages.length} message(s) from tool`);
          }

          // Update context with tool response
          state.context = toolResult.response;

          // Add tool call and result to conversation history
          conversationHistory.push({
            role: 'assistant',
            content: '',
            tool_calls: [{
              id: `call_${state.iteration}`,
              type: 'function',
              function: { name: toolCall.name, arguments: JSON.stringify(toolCall.args) },
            }],
          });
          conversationHistory.push({
            role: 'tool',
            content: buildLoopContinuationMessage(toolResult.response),
            tool_call_id: `call_${state.iteration}`,
          });

          console.log(`[CHAT AGENT] Tool complete, continuing loop with context: ${toolResult.response.substring(0, 100)}...`);
          continue;
        } catch (error) {
          console.error(`[CHAT AGENT] Tool error:`, error);
          state.accumulatedToolMessages.push(
            "I tried to help but encountered an issue. Please try again!"
          );
          break;
        }
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
