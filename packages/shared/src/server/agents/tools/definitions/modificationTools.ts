import { z } from 'zod';
import type { ToolDefinition } from '../types';
import { toToolResult } from '@/server/services/agents/shared/utils';
import type { ToolResult } from '@/server/services/agents/types/shared';

/**
 * Modification agent tools
 *
 * These tools are available to the modifications:router agent.
 * All schemas are empty - params come from context.
 */

export const modifyWorkoutTool: ToolDefinition = {
  name: 'modify_workout',
  description: `Regenerate today's workout keeping the SAME muscle group/focus but with different constraints.

NOTE: All parameters (userId, date, request) are automatically filled from context - no input needed.

Use ONLY when the user explicitly wants to keep the same muscle group/workout type but change HOW they do it:
- Same muscle group, different equipment (e.g., "Today is chest - can't make it to my gym, need a chest workout with just dumbbells")
- Same focus, different time (e.g., "Today is leg day but only have 30 min, can you adjust my leg workout?")
- Same workout, different constraints (e.g., "Today's shoulder workout but my shoulder hurts, can you modify it to be gentler?")

IMPORTANT: User must indicate they want to keep the SAME muscle group/workout type.
DO NOT use if user requests a DIFFERENT muscle group or doesn't specify - use modify_week instead.
This is the LEAST commonly used tool - default to modify_week when uncertain.`,
  schema: z.object({}),
  execute: async (ctx): Promise<ToolResult> => {
    const result = await ctx.services.workoutModification.modifyWorkout({
      userId: ctx.user.id,
      workoutDate: ctx.extras?.workoutDate as Date,
      changeRequest: ctx.message,
    });
    return toToolResult(result);
  },
};

export const modifyWeekTool: ToolDefinition = {
  name: 'modify_week',
  description: `Modify the weekly training pattern and regenerate workouts as needed. **This is the PRIMARY and MOST COMMON tool.**

NOTE: All parameters (userId, targetDay, request) are automatically filled from context - no input needed.

Use this for ANY request for a different workout type or muscle group:
- ANY different muscle group request (e.g., "can I have a leg workout", "chest workout please", "give me back instead")
- ANY different workout type (e.g., "I actually want to run today instead", "cardio today?", "full body workout")
- Rearranging the weekly schedule (e.g., "can we swap my rest days?", "move leg day to Friday")
- Multi-day constraints (e.g., "traveling this week with hotel gym", "only 30 min per day rest of week")

**DEFAULT TO THIS TOOL when user requests a workout change.** Even if they don't explicitly say "instead of" or mention multiple days.

This intelligently updates the weekly pattern to maintain training balance and muscle group spacing.`,
  schema: z.object({}),
  execute: async (ctx): Promise<ToolResult> => {
    const result = await ctx.services.workoutModification.modifyWeek({
      userId: ctx.user.id,
      targetDay: ctx.extras?.targetDay as string,
      changeRequest: ctx.message,
    });
    return toToolResult(result);
  },
};

export const modifyPlanTool: ToolDefinition = {
  name: 'modify_plan',
  description: `Modify the user's overall fitness plan/program structure.

NOTE: All parameters (userId, changeRequest) are automatically filled from context - no input needed.

Use when the user wants to change their PROGRAM-LEVEL settings:
- Training frequency changes (e.g., "change from 5 to 6 days a week")
- Adding/removing fixed schedule items (e.g., "add yoga on Monday/Friday mornings")
- Changing their training split (e.g., "switch to push/pull/legs")
- Adjusting overall goals or focus (e.g., "more cardio", "focus on strength")
- Equipment/facility changes (e.g., "I joined a new gym with more equipment")

DO NOT use for day-to-day or single week changes - use modify_week or modify_workout instead.
This tool is for STRUCTURAL/ARCHITECTURAL changes to the entire training program.`,
  schema: z.object({}),
  execute: async (ctx): Promise<ToolResult> => {
    const result = await ctx.services.planModification.modifyPlan({
      userId: ctx.user.id,
      changeRequest: ctx.message,
    });
    return toToolResult(result);
  },
};
