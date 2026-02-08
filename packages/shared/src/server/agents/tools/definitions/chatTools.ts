import { z } from 'zod';
import type { ToolDefinition } from '../types';
import type { ToolResult } from '@/server/services/agents/types/shared';

/**
 * Chat agent tools
 *
 * These tools are available to the chat:generate agent.
 * They delegate to services via ctx.services at invocation time.
 */

export const updateProfileTool: ToolDefinition = {
  name: 'update_profile',
  description: `Record permanent user preferences and profile information.

Use this tool when the user shares PERMANENT information:
- **Preferences**: "I like starting with legs", "I prefer barbells", "I hate lunges"
- **Constraints/Injuries**: "I hurt my knee", "I have a bad shoulder"
- **Schedule preferences**: "I prefer runs on Tuesdays", "I like morning workouts"
- **Goals**: "I want to lose 10lbs", "training for a marathon"
- **Equipment/Location**: "I go to Planet Fitness", "I have a home gym"
- **Settings**: timezone, send time, or name changes

DO NOT use for one-time requests ("switch today to legs") or questions.

IMPORTANT: If user wants BOTH a preference AND a workout change, call BOTH tools.
Example: "Add runs to my plan on Tues/Thurs" -> update_profile (preference) + make_modification (plan change)

All context is automatically provided - no parameters needed.`,
  schema: z.object({}),
  priority: 1,
  execute: async (ctx): Promise<ToolResult> => {
    return ctx.services.profile.updateProfile(
      ctx.user.id,
      ctx.message,
      ctx.previousMessages
    );
  },
};

export const makeModificationTool: ToolDefinition = {
  name: 'make_modification',
  description: `Make changes to the user's workout or training program.

Use this tool for:
- **Today's Workout**: Swap exercises, different constraints, different equipment
- **Weekly Schedule**: Change workout type, muscle group, or training day
- **Program-Level**: Frequency, training splits, overall focus

This tool handles WORKOUT CONTENT - not user settings like send time, timezone, or name.
All context (user, message, date, etc.) is automatically provided - no parameters needed.`,
  schema: z.object({
    message: z.string().describe(
      'REQUIRED. Brief acknowledgment to send immediately (1 sentence). Example: "Got it, switching to legs!"'
    ),
  }),
  priority: 3,
  execute: async (ctx, args): Promise<ToolResult> => {
    return ctx.services.modification.makeModification(
      ctx.user.id,
      ctx.message,
      ctx.previousMessages
    );
  },
};

export const getWorkoutTool: ToolDefinition = {
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
  priority: 2,
  execute: async (ctx): Promise<ToolResult> => {
    const timezone = ctx.user.timezone || 'America/New_York';
    return ctx.services.training.getOrGenerateWorkout(ctx.user.id, timezone);
  },
};
