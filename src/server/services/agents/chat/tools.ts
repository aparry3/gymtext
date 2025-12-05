import { z } from 'zod';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';
import type { ToolResult } from '../shared/types';
import type { Message } from '@/server/models/messageModel';

/**
 * Dependencies for chat tools (DI pattern)
 * Pass the methods directly, not the full services
 */
export interface ChatToolDeps {
  updateProfile: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
  makeModification: (userId: string, message: string, previousMessages?: Message[]) => Promise<ToolResult>;
}

/**
 * Context required for chat tools
 */
export interface ChatToolContext {
  userId: string;
  message: string;
  previousMessages?: Message[];
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
  deps: ChatToolDeps
): StructuredToolInterface[] => {
  // Tool 1: Update Profile
  const updateProfileTool = tool(
    async (): Promise<ToolResult> => {
      return deps.updateProfile(context.userId, context.message, context.previousMessages);
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

  // Tool 2: Make Modification
  const makeModificationTool = tool(
    async (): Promise<ToolResult> => {
      return deps.makeModification(context.userId, context.message, context.previousMessages);
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
All context (user, message, date, etc.) is automatically provided.`,
      schema: z.object({
        message: z.string().describe(
          'Brief acknowledgment to send immediately (1 sentence). Example: "Got it, switching to legs!"'
        ),
      }),
    }
  );

  return [updateProfileTool, makeModificationTool];
};
