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
Example: "Add runs to my plan on Tues/Thurs" -> update_profile (preference) + modify_workout or modify_plan (change)

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

export const modifyWorkoutTool: ToolDefinition = {
  name: 'modify_workout',
  description: `Modify workouts or restructure the weekly schedule within the current week dossier.

Use this tool for ANY workout or schedule change within a week:
- **Single-day changes**: "give me different back exercises", "only dumbbells today", "I only have 30 minutes", "can I do legs instead?"
- **Schedule rearrangement**: "move legs to Wednesday", "swap Monday and Thursday"
- **Multi-day changes**: "I'm travelling Wed-Fri, make those rest days"
- **Schedule around events**: "I have a game Saturday, make Friday light"
- **Intensity/volume**: "make it lighter today", "I want something harder"

This is the MOST COMMON modification tool. Use it for any change within a week.
Do NOT use for program-level changes (use modify_plan).

You can optionally specify targetDay for schedule changes and targetWeek for next-week modifications.
If the user says "next week" or is responding to their upcoming week overview, use targetWeek: "next".

The acknowledgment message is sent to the user immediately. Your final response should summarize what changed, not repeat the acknowledgment.`,
  schema: z.object({
    message: z.string().describe(
      'Brief acknowledgment to send immediately (1 sentence). Example: "Got it, switching to legs!"'
    ),
    changeRequest: z.string().describe(
      'Clear, specific description of what to change and why. Synthesize the conversation into clear instructions — do NOT pass the raw user message. Include WHAT to change, WHERE (which day), WHY (user\'s reason), and any constraints.'
    ),
    targetDay: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']).optional().describe(
      'The primary day being modified. Required for schedule rearrangements, optional for single-day changes (defaults to today).'
    ),
    targetWeek: z.enum(['current', 'next']).optional().default('current').describe(
      'Which week to modify. Use "next" if the user references next week or is responding to their upcoming week overview. Defaults to "current".'
    ),
  }),
  priority: 3,
  execute: async (ctx, args): Promise<ToolResult> => {
    const ackMessage = args.message as string;
    await ctx.services.queueMessage(ctx.user, { content: ackMessage }, 'chat');

    const { now, getNextWeekStart } = await import('@/shared/utils/date');
    const timezone = ctx.user.timezone || 'America/New_York';
    const todayDate = now(timezone).toJSDate();

    const targetWeek = (args.targetWeek as 'current' | 'next') ?? 'current';
    let weekStartDate: Date | undefined;
    if (targetWeek === 'next') {
      weekStartDate = getNextWeekStart(todayDate, timezone);
    }

    const result = await ctx.services.workoutModification.modifyWorkout({
      userId: ctx.user.id,
      workoutDate: todayDate,
      changeRequest: (args.changeRequest as string) || ctx.message,
      targetDay: args.targetDay as string | undefined,
      weekStartDate,
    });
    return {
      toolType: 'action',
      response: result.modifications || 'Workout modified successfully.',
      messages: [ackMessage, ...result.messages],
    };
  },
};

export const modifyPlanTool: ToolDefinition = {
  name: 'modify_plan',
  description: `Make program-level changes - frequency, training split, overall goals.

Use this tool for changes that affect the ENTIRE TRAINING PROGRAM:
- Frequency: "I want to train 5 days instead of 4"
- Split changes: "switch me to push/pull/legs"
- Goal changes: "I want to focus more on hypertrophy"
- Adding modalities: "add 2 running days per week"

Do NOT use for single-day workout changes or schedule rearrangement (use modify_workout).

The acknowledgment message is sent to the user immediately. Your final response should summarize what changed, not repeat the acknowledgment.`,
  schema: z.object({
    message: z.string().describe(
      'Brief acknowledgment to send immediately (1 sentence). Example: "Got it, updating your program!"'
    ),
    changeRequest: z.string().describe(
      'Clear, specific description of what to change and why. Synthesize the conversation into clear instructions — do NOT pass the raw user message. Include WHAT to change (frequency, split, goals), WHY, and any constraints.'
    ),
  }),
  priority: 3,
  execute: async (ctx, args): Promise<ToolResult> => {
    const ackMessage = args.message as string;
    await ctx.services.queueMessage(ctx.user, { content: ackMessage }, 'chat');
    const result = await ctx.services.planModification.modifyPlan({
      userId: ctx.user.id,
      changeRequest: (args.changeRequest as string) || ctx.message,
    });
    return {
      toolType: 'action',
      response: result.modifications || 'Plan modified successfully.',
      messages: [ackMessage, ...result.messages],
    };
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
1. Check the week dossier for today's workout
2. If no week exists, trigger generation
3. Return the workout text and send the workout message

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
