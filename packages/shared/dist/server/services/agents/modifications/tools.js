import { z } from 'zod';
import { tool } from '@langchain/core/tools';
import { toToolResult } from '../shared/utils';
// Schema definitions - empty because all params come from context
const ModifyWorkoutSchema = z.object({});
const ModifyWeekSchema = z.object({});
const ModifyPlanSchema = z.object({});
/**
 * Factory function to create modification tools with injected dependencies (DI pattern)
 *
 * This allows services to be injected rather than directly imported,
 * breaking circular dependencies and improving testability.
 *
 * All tools return standardized ToolResult: { response: string, messages?: string[] }
 *
 * @param context - Context from chat (userId, message, workoutDate, targetDay)
 * @param deps - Dependencies including workout and microcycle services
 * @returns Array of LangChain tools configured with the provided services
 */
export const createModificationTools = (context, deps) => {
    // Tool 1: Modify Workout
    const modifyWorkoutTool = tool(async () => {
        const result = await deps.modifyWorkout({
            userId: context.userId,
            workoutDate: context.workoutDate,
            changeRequest: context.message,
        });
        return toToolResult(result);
    }, {
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
        schema: ModifyWorkoutSchema,
    });
    // Tool 2: Modify Week
    const modifyWeekTool = tool(async () => {
        const result = await deps.modifyWeek({
            userId: context.userId,
            targetDay: context.targetDay,
            changeRequest: context.message,
        });
        return toToolResult(result);
    }, {
        name: 'modify_week',
        description: `Modify the weekly training pattern and regenerate workouts as needed. **This is the PRIMARY and MOST COMMON tool.**

NOTE: All parameters (userId, targetDay, request) are automatically filled from context - no input needed.

Use this for ANY request for a different workout type or muscle group:
- ANY different muscle group request (e.g., "can I have a leg workout", "chest workout please", "give me back instead")
- ANY different workout type (e.g., "I actually want to run today instead", "cardio today?", "full body workout")
- Rearranging the weekly schedule (e.g., "can we swap my rest days?", "move leg day to Friday")
- Multi-day constraints (e.g., "traveling this week with hotel gym", "only 30 min per day rest of week")

**DEFAULT TO THIS TOOL when user requests a workout change.** Even if they don't explicitly say "instead of" or mention multiple days.

Examples that should use modify_week:
- "Can I do legs today?" -> YES (different muscle group)
- "Chest workout please" -> YES (potentially different from scheduled)
- "I want to run instead" -> YES (different workout type)
- "Can't make it to gym this week" -> YES (multi-day change)

This intelligently updates the weekly pattern to maintain training balance and muscle group spacing.`,
        schema: ModifyWeekSchema,
    });
    // Tool 3: Modify Plan
    const modifyPlanTool = tool(async () => {
        const result = await deps.modifyPlan({
            userId: context.userId,
            changeRequest: context.message,
        });
        return toToolResult(result);
    }, {
        name: 'modify_plan',
        description: `Modify the user's overall fitness plan/program structure.

NOTE: All parameters (userId, changeRequest) are automatically filled from context - no input needed.

Use when the user wants to change their PROGRAM-LEVEL settings:
- Training frequency changes (e.g., "change from 5 to 6 days a week", "I want to train 4 days instead of 3")
- Adding/removing fixed schedule items (e.g., "add yoga on Monday/Friday mornings", "I joined a spinning class on Wednesdays")
- Changing their training split (e.g., "switch to push/pull/legs", "I want an upper/lower split")
- Adjusting overall goals or focus (e.g., "more cardio", "focus on strength", "add more conditioning")
- Equipment/facility changes (e.g., "I joined a new gym with more equipment", "I only have dumbbells now")

DO NOT use for day-to-day or single week changes - use modify_week or modify_workout instead.
This tool is for STRUCTURAL/ARCHITECTURAL changes to the entire training program.

Examples that should use modify_plan:
- "Can we change to 6 days a week?" -> YES (frequency change)
- "I started yoga on Mondays and Fridays" -> YES (adding anchors)
- "Switch me to a PPL split" -> YES (program structure)
- "I want more cardio overall" -> YES (program balance)

Examples that should NOT use modify_plan:
- "Can I do legs today?" -> NO (use modify_week)
- "Skip today's workout" -> NO (use modify_week)`,
        schema: ModifyPlanSchema,
    });
    return [
        modifyWorkoutTool,
        modifyWeekTool,
        modifyPlanTool,
    ];
};
