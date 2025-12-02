import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { CHAT_SYSTEM_PROMPT, buildChatUserMessage } from '@/server/agents/conversation/chat/prompts';
import { initializeModel, createRunnableAgent } from '../../base';
import { createProfileUpdateAgent, ProfileUpdateOutput } from '../../profile';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { ChatInput, ChatOutput, ChatAgentDeps, ModificationsAgentInput, ModificationsResponse } from './types';
import { type WorkoutModificationService, type MicrocycleModificationService, type PlanModificationServiceInterface } from './modifications/tools';
import { createModificationsAgent } from './modifications/chain';
import { formatForAI, now, getWeekday, DAY_NAMES } from '@/shared/utils/date';

// Re-export types for backward compatibility
export type { ChatAgentDeps, WorkoutModificationService, MicrocycleModificationService, PlanModificationServiceInterface };

/**
 * Chat Agent Factory (The Coordinator)
 *
 * The "Single Brain" of the conversation.
 *
 * Architecture (Linear & Flattened):
 * 1. **Profile Phase (The Scribe):**
 *    - Runs first on the aggregated user message.
 *    - Updates the Markdown Profile (Goals, Injuries, PRs).
 *    - Returns a `updateSummary` (e.g., "Logged 225 bench PR").
 *
 * 2. **Coordinator Phase (The Coach):**
 *    - Receives User Message + Profile Update Summary.
 *    - Has access to Modification Tools (Swap, Change Week, etc.).
 *    - Decides whether to:
 *      a) Call a tool (if user wants changes).
 *      b) Answer a question (using internal knowledge).
 *      c) Chat/Greet.
 *    - Always acknowledges the Profile Update Summary in the text response.
 *
 * @param deps - Dependencies injected by the service
 * @returns Agent that processes chat messages
 */
export const createChatAgent = (deps: ChatAgentDeps) => {
  return createRunnableAgent<ChatInput, ChatOutput>(async (input) => {
    const { user, message, previousMessages, currentWorkout } = input;
    console.log('[CHAT AGENT] Starting coordinator for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    // 1. Calculate context for modifications
    const today = now(user.timezone).toJSDate();
    const weekday = getWeekday(today, user.timezone);
    const targetDay = DAY_NAMES[weekday - 1];

    // 2. Create the modifications agent with service dependencies
    const modificationsAgent = createModificationsAgent({
      modifyWorkout: deps.modifyWorkout,
      modifyWeek: deps.modifyWeek,
      modifyPlan: deps.modifyPlan,
    });

    // 3. Create the single make_modification wrapper tool
    // All context is passed via closure - no parameters needed
    const makeModificationTool = tool(
      async (): Promise<ModificationsResponse> => {
        const agentInput: ModificationsAgentInput = {
          user,
          message,
          previousMessages,
          currentWorkout,
          workoutDate: today,
          targetDay,
        };
        return await modificationsAgent.invoke(agentInput);
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

    // 4. Profile Runnable (The Scribe)
    // Always runs first to capture facts/PRs from the message
    const profileRunnable = RunnableLambda.from(async (input: ChatInput) => {
      const currentProfile = input.user.profile || '';
      const agent = createProfileUpdateAgent();
      return await agent.invoke({
        currentProfile,
        message: input.message,
        user: input.user,
        currentDate: formatForAI(new Date(), input.user.timezone),
      });
    });

    // 5. Main Coordinator Runnable
    // Takes the result of the profile update and the original input
    const coordinatorRunnable = RunnableLambda.from(async (stepInput: ChatInput & { profileResult: ProfileUpdateOutput }) => {
      const { profileResult } = stepInput;

      // Save profile if updated
      if (profileResult.wasUpdated) {
        await deps.saveProfile(user.id, profileResult.updatedProfile);
        console.log('[CHAT AGENT] Profile updated and saved:', profileResult.updateSummary);
      }

      // Initialize Model with the single make_modification tool
      const model = initializeModel(undefined, deps.config).bindTools([makeModificationTool]);

      // Build Messages
      const userMessageContent = buildChatUserMessage(
        message,
        user.timezone,
        profileResult.updateSummary, // Pass the summary so the agent can acknowledge it
        currentWorkout
      );

      const messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        { role: 'user', content: userMessageContent }
      ];

      // Invoke Model
      console.log('[CHAT AGENT] Invoking coordinator model...');
      const result = await model.invoke(messages);

      // Handle Tool Call vs Text Response
      if (result.tool_calls && result.tool_calls.length > 0) {
        const toolCall = result.tool_calls[0];
        console.log(`[CHAT AGENT] Tool call detected: ${toolCall.name}`);

        if (toolCall.name === 'make_modification') {
          // Execute the wrapper tool - it returns ModificationsResponse with messages[]
          const toolResult = await makeModificationTool.invoke(toolCall.args) as ModificationsResponse;

          console.log(`[CHAT AGENT] Modification complete, ${toolResult.messages.length} message(s) returned`);

          // Return messages from the modifications agent
          return {
            messages: toolResult.messages,
            profileUpdated: profileResult.wasUpdated
          };
        }
      }

      // Default: Text response (no tool was called)
      return {
        response: result.content as string,
        profileUpdated: profileResult.wasUpdated
      };
    });

    // 5. Sequence
    const sequence = RunnableSequence.from([
      RunnablePassthrough.assign({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        profileResult: profileRunnable as any
      }),
      coordinatorRunnable
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await sequence.invoke(input as any);
  });
};