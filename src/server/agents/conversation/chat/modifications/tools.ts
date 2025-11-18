import { z } from 'zod';
import { type UpdateWorkoutResult, type ModifyWeekResult } from '@/server/services';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';

/**
 * Service interfaces for modification tools (DI)
 */
export interface WorkoutModificationService {
  modifyWorkout: (params: UpdateWorkoutParams) => Promise<UpdateWorkoutResult>;
}

export interface MicrocycleModificationService {
  modifyWeek: (params: ModifyWeekParams) => Promise<ModifyWeekResult>;
}

/**
 * Dependencies for modification tools
 */
export interface ModificationToolDeps {
  workoutService: WorkoutModificationService;
  microcycleService: MicrocycleModificationService;
}

// Schema definitions
const UpdateWorkoutSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  reason: z.string().describe('Reason for the modification'),
  constraints: z.array(z.string()).describe('List of constraints or modifications needed (e.g., "No gym equipment", "Avoid shoulder exercises", "30 minutes max")'),
  preferredEquipment: z.array(z.string()).nullish().describe('Optional: equipment available (e.g., ["dumbbells", "resistance bands"])'),
  focusAreas: z.array(z.string()).nullish().describe('Optional: specific areas to focus on or avoid'),
});

type UpdateWorkoutInput = z.infer<typeof UpdateWorkoutSchema>;

export interface UpdateWorkoutParams {
  userId: string;
  workoutDate: Date;
  reason: string;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}

const ModifyWeekSchema = z.object({
  userId: z.string().describe('The user ID'),
  targetDay: z.string().describe('The day being modified (e.g., "Monday", "Tuesday", "Wednesday"). Typically "today" or the current day of the week.'),
  changes: z.array(z.string()).describe('List of all changes and constraints needed. Include everything in this array - both changes to the target day and any constraints for remaining days. Examples: ["Change chest to back workout", "Use dumbbells only for today", "Hotel gym constraints for rest of week", "30 min limit per day"]'),
  reason: z.string().describe('Why the modification is needed (e.g., "Gym is too crowded for chest workout", "Traveling for work with limited equipment", "Weather preventing outdoor cardio")'),
});

type ModifyWeekInput = z.infer<typeof ModifyWeekSchema>;

export interface ModifyWeekParams {
  userId: string;
  targetDay: string;
  changeRequest: string;
  reason: string;
}
/**
 * Factory function to create modification tools with injected dependencies (DI pattern)
 *
 * This allows services to be injected rather than directly imported,
 * breaking circular dependencies and improving testability.
 *
 * @param deps - Dependencies including workout and microcycle services
 * @returns Array of LangChain tools configured with the provided services
 */
export const createModificationTools = (deps: ModificationToolDeps): StructuredToolInterface[] => {
  // Tool 1: Modify Workout
  const modifyWorkoutTool = tool(
    async ({ userId, workoutDate, reason, constraints, preferredEquipment, focusAreas }: UpdateWorkoutInput): Promise<UpdateWorkoutResult> => {
      return await deps.workoutService.modifyWorkout({
        userId,
        workoutDate: new Date(workoutDate),
        reason,
        constraints,
        preferredEquipment: preferredEquipment ?? undefined,
        focusAreas: focusAreas ?? undefined,
      });
    },
    {
      name: 'modify_workout',
      description: `Regenerate today's workout keeping the SAME muscle group/focus but with different constraints.

Use ONLY when the user explicitly wants to keep the same muscle group/workout type but change HOW they do it:
- Same muscle group, different equipment (e.g., "Today is chest - can't make it to my gym, need a chest workout with just dumbbells")
- Same focus, different time (e.g., "Today is leg day but only have 30 min, can you adjust my leg workout?")
- Same workout, different constraints (e.g., "Today's shoulder workout but my shoulder hurts, can you modify it to be gentler?")

IMPORTANT: User must indicate they want to keep the SAME muscle group/workout type.
DO NOT use if user requests a DIFFERENT muscle group or doesn't specify - use modify_week instead.
This is the LEAST commonly used tool - default to modify_week when uncertain.`,
      schema: UpdateWorkoutSchema,
    }
  );

  // Tool 2: Modify Week
  const modifyWeekTool = tool(
    async ({ userId, targetDay, changes, reason }: ModifyWeekInput): Promise<ModifyWeekResult> => {
      // Convert changes array to a single changeRequest string
      const changeRequest = changes.join('. ');

      return await deps.microcycleService.modifyWeek({
        userId,
        targetDay,
        changeRequest,
        reason,
      });
    },
    {
      name: 'modify_week',
      description: `Modify the weekly training pattern and regenerate workouts as needed. **This is the PRIMARY and MOST COMMON tool.**

Use this for ANY request for a different workout type or muscle group:
- ANY different muscle group request (e.g., "can I have a leg workout", "chest workout please", "give me back instead")
- ANY different workout type (e.g., "I actually want to run today instead", "cardio today?", "full body workout")
- Rearranging the weekly schedule (e.g., "can we swap my rest days?", "move leg day to Friday")
- Multi-day constraints (e.g., "traveling this week with hotel gym", "only 30 min per day rest of week")

**DEFAULT TO THIS TOOL when user requests a workout change.** Even if they don't explicitly say "instead of" or mention multiple days.

Examples that should use modify_week:
- "Can I do legs today?" → YES (different muscle group)
- "Chest workout please" → YES (potentially different from scheduled)
- "I want to run instead" → YES (different workout type)
- "Can't make it to gym this week" → YES (multi-day change)

Parameters:
- targetDay: Which day to start modifications (typically "today" or current weekday)
- changes: Array of all modifications (e.g., ["Change to leg workout", "Use dumbbells only for rest of week"])
- reason: Why the changes are needed

This intelligently updates the weekly pattern to maintain training balance and muscle group spacing.`,
      schema: ModifyWeekSchema,
    }
  );

  return [
    modifyWorkoutTool,
    modifyWeekTool,
  ];
};

/**
 * Legacy export for backward compatibility
 * @deprecated Use createModificationTools with dependency injection instead
 */
export const modificationTools = createModificationTools({
  workoutService: {
    modifyWorkout: async () => {
      throw new Error('modificationTools is deprecated. Use createModificationTools with dependencies injection instead.');
    },
  },
  microcycleService: {
    modifyWeek: async () => {
      throw new Error('modificationTools is deprecated. Use createModificationTools with dependencies injection instead.');
    },
  },
});
