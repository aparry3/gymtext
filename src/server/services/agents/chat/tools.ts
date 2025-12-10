import { z } from 'zod';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolResult } from '../shared/types';
import type { Message } from '@/server/models/messageModel';

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
export function toolWithMessage(
  name: string,
  description: string,
  callback: () => Promise<ToolResult>,
  onSendMessage: (message: string) => Promise<void>
): StructuredToolInterface {
  return tool(
    async (args: { message: string }): Promise<ToolResult> => {
      // Send immediate message before execution
      if (args.message) {
        try {
          await onSendMessage(args.message);
          console.log(`[toolWithMessage] Sent: ${args.message}`);
        } catch (error) {
          console.error('[toolWithMessage] Failed to send:', error);
        }
      }
      return callback();
    },
    {
      name,
      description,
      schema: z.object({
        message: z.string().describe(
          'REQUIRED. Brief acknowledgment to send immediately (1 sentence). Example: "Got it, switching to legs!"'
        ),
      }),
    }
  );
}

/**
 * Dependencies for chat tools (DI pattern)
 * Pass the methods directly, not the full services
 */
export interface ChatToolDeps {
  updateProfile: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
  makeModification: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
  getWorkout: (userId: string, timezone: string) => Promise<ToolResult>;
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
 * - update_profile: Record fitness information to user's profile
 * - make_modification: Make changes to workouts, schedules, or plans
 *
 * All tools return standardized ToolResult: { response: string, messages?: string[] }
 *
 * @param context - Context from chat (userId, message)
 * @param deps - Dependencies (updateProfile, makeModification methods)
 * @returns Array of LangChain tools
 */
export const createChatTools = (
  context: ChatToolContext,
  deps: ChatToolDeps,
  onSendMessage: (message: string) => Promise<void>
): StructuredToolInterface[] => {
  // Tool 1: Update Profile
  const updateProfileTool = tool(
    async (): Promise<ToolResult> => {
      return deps.updateProfile(context.userId, context.message, context.previousMessages);
    },
    {
      name: 'update_profile',
      description: `Update the user's profile or personal settings.

Use this tool for:
- **User Settings**: Send time, timezone, name, notification preferences
- **Fitness Profile**: Injuries, goals, equipment, availability, PRs, achievements

This tool handles WHO THE USER IS and THEIR PREFERENCES - not their workouts.
All context is automatically provided - no parameters needed.`,
      schema: z.object({}),
    }
  );

  // Tool 2: Make Modification
  const makeModificationTool = toolWithMessage(
    'make_modification',
    `Make changes to the user's workout or training program.

Use this tool for:
- **Today's Workout**: Swap exercises, different constraints, different equipment
- **Weekly Schedule**: Change workout type, muscle group, or training day
- **Program-Level**: Frequency, training splits, overall focus

This tool handles WORKOUT CONTENT - not user settings like send time, timezone, or name.
All context (user, message, date, etc.) is automatically provided - no parameters needed.`,
    async (): Promise<ToolResult> => {
      return deps.makeModification(context.userId, context.message, context.previousMessages);
    },
    onSendMessage
  );

  // Tool 3: Get Workout
  const getWorkoutTool = tool(
    async (): Promise<ToolResult> => {
      return deps.getWorkout(context.userId, context.timezone);
    },
    {
      name: 'get_workout',
      description: `Get the user's workout for today.

Use this tool when the user asks about their workout for today, such as:
- "What's my workout today?"
- "What am I doing today?"
- "Send me my workout"
- "What exercises do I have?"

This tool will:
1. Check if a workout already exists for today
2. If not, generate one based on their fitness plan
3. Return the full workout details and send the workout message

IMPORTANT: Only use this for TODAY's workout. Do not use for future dates.
If [CONTEXT: WORKOUT] says "No workout scheduled", use this tool to generate it.
All context is automatically provided - no parameters needed.`,
      schema: z.object({}),
    }
  );

  return [updateProfileTool, makeModificationTool, getWorkoutTool];
};
