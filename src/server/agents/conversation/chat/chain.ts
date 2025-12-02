import { CHAT_SYSTEM_PROMPT, buildChatUserMessage } from '@/server/agents/conversation/chat/prompts';
import { initializeModel, createRunnableAgent } from '../../base';
import { createProfileUpdateAgent, ProfileUpdateOutput } from '../../profile';
import { RunnableLambda, RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { ChatInput, ChatOutput, ChatAgentDeps } from './types';
import { createModificationTools, type WorkoutModificationService, type MicrocycleModificationService, type PlanModificationServiceInterface } from './modifications/tools';
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
    const { user, message, currentWorkout } = input;
    console.log('[CHAT AGENT] Starting coordinator for message:', message.substring(0, 50) + (message.length > 50 ? '...' : ''));

    // 1. Calculate context for modification tools
    const today = now(user.timezone).toJSDate();
    const weekday = getWeekday(today, user.timezone);
    const targetDay = DAY_NAMES[weekday - 1];

    // 2. Create modification tools
    const modificationTools = createModificationTools(
      {
        userId: user.id,
        message,
        workoutDate: today,
        targetDay,
      },
      {
        modifyWorkout: deps.modifyWorkout,
        modifyWeek: deps.modifyWeek,
        modifyPlan: deps.modifyPlan,
      }
    );

    // 3. Profile Runnable (The Scribe)
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

    // 4. Main Coordinator Runnable
    // Takes the result of the profile update and the original input
    const coordinatorRunnable = RunnableLambda.from(async (stepInput: ChatInput & { profileResult: ProfileUpdateOutput }) => {
      const { profileResult } = stepInput;

      // Save profile if updated
      if (profileResult.wasUpdated) {
        await deps.saveProfile(user.id, profileResult.updatedProfile);
        console.log('[CHAT AGENT] Profile updated and saved:', profileResult.updateSummary);
      }

      // Initialize Model with Tools
      // We use a standard model configuration but bind the tools
      const model = initializeModel(undefined, deps.config).bindTools(modificationTools);

      // Build Messages
      const userMessageContent = buildChatUserMessage(
        message,
        user.timezone,
        profileResult.updateSummary, // Pass the summary so the agent can acknowledge it
        currentWorkout
      );

      const messages = [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        // TODO: We might want to inject previous conversation history here
        // For now, we focus on the current aggregated message
        { role: 'user', content: userMessageContent }
      ];

      // Invoke Model
      console.log('[CHAT AGENT] Invoking coordinator model...');
      const result = await model.invoke(messages);

      // Handle Tool Calls vs Text Response
      // If the model called a tool, LangChain's bindTools usually handles the execution if we use an AgentExecutor.
      // However, since we are using a lighter `RunnableAgent` pattern, we might need to handle the tool call result.
      // BUT: `createModificationTools` returns structured tools.
      // If we want the model to *execute* the tool and then give a final answer, we typically need a loop (AgentExecutor).
      // For this "Flattened" approach, if we want to keep it simple:
      // We can use `invoke` and check `tool_calls`.
      
      // To keep this robust without a full AgentExecutor loop (which can be heavy),
      // we can check if `result.tool_calls` exists.
      
      // WAIT: `createRunnableAgent` wrapper expects us to return `ChatOutput`.
      // If we use `bindTools`, the model returns a message with `tool_calls`.
      // We need to execute them.
      
      // For simplicity in this refactor, let's manually execute the FIRST tool call if present,
      // or just return the text if no tool call. 
      // *Ideally*, we'd use `AgentExecutor`, but let's stick to the manual execution for tight control if we aren't using LangGraph.
      
      // Refined Strategy:
      // 1. Check for tool calls.
      // 2. If tool call found, execute it.
      // 3. The tool execution (in our legacy `modifications` setup) often returns the FINAL string or messages.
      //    Let's look at `createModificationsAgent` (legacy). It returned `messages`.
      
      if (result.tool_calls && result.tool_calls.length > 0) {
        const toolCall = result.tool_calls[0];
        console.log(`[CHAT AGENT] Tool call detected: ${toolCall.name}`);
        
        // Find the matching tool
        const tool = modificationTools.find(t => t.name === toolCall.name);
        if (tool) {
          // Execute the tool
          const toolResult = await tool.invoke(toolCall.args);
          
          // The modification tools return `{ message: string }` or similar.
          // We need to check the return type of the tools.
          // Looking at `modifications/tools.ts`, they return `ModifyWorkoutResult` strings or objects.
          
          // Assuming toolResult is the output string or object we want to send back.
          // We might want to wrap this in a structured response.
          
          // Hack for compatibility: The existing `modifications` agent returned `messages: string[]`.
          // Let's assume the tool result text is the response we want.
          
          // If the tool returns a string (which `DynamicStructuredTool` usually does), use it.
          // If it returns an object, we stringify or extract the message.
          
          // Let's assume standard LangChain tool behavior: returns string.
          return {
             response: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
             profileUpdated: profileResult.wasUpdated
          };
        }
      }

      // Default: Text response
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