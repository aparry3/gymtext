import { z } from 'zod';
import { workoutInstanceService, type SubstituteExerciseResult } from '@/server/services/workoutInstanceService';
import { microcycleService, type ModifyWeekResult } from '@/server/services/microcycleService';
import { tool } from '@langchain/core/tools';
import type { ModifyWorkoutResult } from '@/server/services/workoutInstanceService';

const SubstituteExerciseSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  exercises: z.array(z.string()).describe('List of exercises to replace (e.g., ["Barbell Bench Press", "Squat"])'),
  reason: z
    .string()
    .describe('Reason for the substitution (e.g., "No barbell available", "Shoulder injury")'),
});

type SubstituteExerciseInput = z.infer<typeof SubstituteExerciseSchema>;

const substituteFunction = async ({
  userId,
  workoutDate,
  exercises,
  reason,
}: SubstituteExerciseInput): Promise<SubstituteExerciseResult> => {
  return await workoutInstanceService.substituteExercise({
    userId,
    workoutDate: new Date(workoutDate),
    exercises,
    reason,
  });
};

export const substituteExerciseTool = tool(
  substituteFunction,
  {
    name: 'substitute_exercise',
    description: `Substitute a specific exercise or block in the user's current workout.
Use this when the user wants to swap one exercise for another due to equipment limitations,
preferences, or other constraints. This modifies the existing workout in place.`,
    schema: SubstituteExerciseSchema,
  }
);


const ModifyWorkoutSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  reason: z.string().describe('Reason for the modification'),
  constraints: z.array(z.string()).describe('List of constraints or modifications needed (e.g., "No gym equipment", "Avoid shoulder exercises", "30 minutes max")'),
  preferredEquipment: z.array(z.string()).optional().describe('Optional: equipment available (e.g., ["dumbbells", "resistance bands"])'),
  focusAreas: z.array(z.string()).optional().describe('Optional: specific areas to focus on or avoid'),
});

type ModifyWorkoutInput = z.infer<typeof ModifyWorkoutSchema>;

const modifyWorkoutFunction = async ({ userId, workoutDate, reason, constraints, preferredEquipment, focusAreas }: ModifyWorkoutInput): Promise<ModifyWorkoutResult> => {
  return await workoutInstanceService.modifyWorkout({
    userId,
    workoutDate: new Date(workoutDate),
    reason,
    constraints,
    preferredEquipment,
    focusAreas,
  });
}
/**
 * Tool for modifying a single workout WITHOUT altering the rest of the week
 *
 * Use this when the user needs to change ONE workout but the rest of the week stays the same.
 * This is for one-off changes that don't affect training balance or require pattern updates.
 *
 * Examples:
 * - "I can't make it to the gym today, can I get a home workout instead?" (one-day equipment change)
 * - "I only have 30 minutes today, can you shorten the workout?" (one-day time constraint)
 * - "Can you remove shoulder exercises today, my shoulder is sore?" (one-day injury accommodation)
 *
 * Do NOT use this for muscle group swaps that affect weekly balance - use modify_week instead.
 */
export const modifyWorkoutTool = tool(
  modifyWorkoutFunction,
  {
    name: 'modify_workout',
    description: `Regenerate a SINGLE workout without changing the weekly pattern.

  Use ONLY when the change is isolated to ONE day and doesn't require updating the rest of the week:
  - One-day equipment changes (e.g., "can't go to gym today, need home workout")
  - One-day time constraints (e.g., "only 30 min today")
  - One-day injury accommodations (e.g., "avoid shoulder exercises today")

  DO NOT use for muscle group swaps - use modify_week instead to maintain weekly balance.
  This tool does NOT update the weekly pattern, only regenerates the single workout.`,
    schema: ModifyWorkoutSchema,
  }
);

const ModifyWeekSchema = z.object({
  userId: z.string().describe('The user ID'),
  targetDay: z.string().describe('The day being modified (e.g., "Monday", "Tuesday", "Wednesday"). Typically "today" or the current day of the week.'),
  changes: z.array(z.string()).describe('List of all changes and constraints needed. Include everything in this array - both changes to the target day and any constraints for remaining days. Examples: ["Change chest to back workout", "Use dumbbells only for today", "Hotel gym constraints for rest of week", "30 min limit per day"]'),
  reason: z.string().describe('Why the modification is needed (e.g., "Gym is too crowded for chest workout", "Traveling for work with limited equipment", "Weather preventing outdoor cardio")'),
});

type ModifyWeekInput = z.infer<typeof ModifyWeekSchema>;

const modifyWeekFunction = async ({ userId, targetDay, changes, reason }: ModifyWeekInput): Promise<ModifyWeekResult> => {
  return await microcycleService.modifyWeek({
    userId,
    targetDay,
    changes,
    reason,
  });
}
/**
 * Tool for modifying the weekly training pattern and today's workout
 *
 * This tool intelligently updates the weekly pattern for REMAINING days (today and future) while
 * only regenerating ONE workout (typically today). It ensures training coherence across the week.
 *
 * Use cases:
 * 1. **Muscle Group Swaps**: User wants different muscle group today
 *    Example: "Gym is packed, can you give me a back workout instead of chest?"
 *    -> Changes today to back, then checks remaining days to avoid back-to-back back days
 *    -> May shuffle another day to maintain muscle group balance
 *
 * 2. **Multi-Day Equipment Changes**: Travel affecting multiple days
 *    Example: "I'm traveling Mon-Fri with only hotel gym access"
 *    -> Updates pattern for remaining days with equipment constraints
 *    -> Regenerates today's workout for hotel gym
 *
 * 3. **Multi-Day Schedule Changes**: Time constraints for rest of week
 *    Example: "Only 30 minutes available for workouts the rest of this week"
 *    -> Condenses remaining workouts to fit time constraint
 *
 * Note: Updates the weekly pattern for coherence. Regenerates today's workout ONLY if today's pattern
 * changed (e.g., modifying Thursday might cause Monday to be reshuffled from cardio to strength).
 * Future day workouts will be generated on their respective days using the updated pattern.
 * Use modify_workout instead if the change is truly isolated to one day and doesn't affect weekly balance.
 */
export const modifyWeekTool = tool(
  modifyWeekFunction,
  {
    name: 'modify_week',
    description: `Modify the weekly training pattern for remaining days AND regenerate the target day's workout.

  Use this when changes affect training BALANCE or MULTIPLE days:
  - Muscle group swaps (e.g., "give me back instead of chest") - MUST reshuffle remaining days to avoid conflicts
  - Multi-day equipment/travel changes (e.g., "traveling with hotel gym access this week")
  - Multi-day time constraints (e.g., "only 30 min per day rest of week")
  - Changes requiring pattern updates for coherence

  Do NOT use for isolated one-day changes - use modify_workout instead.

  Parameters:
  - targetDay: Which day to modify (e.g., "Monday", "Tuesday", or "today")
  - changes: Array of all modifications and constraints (e.g., ["Change chest to back", "Use dumbbells only", "Hotel gym for rest of week"])
  - reason: Why the changes are needed

  This updates the microcycle pattern for all remaining days to maintain training balance and muscle group spacing.
  Intelligently regenerates today's workout ONLY if today's pattern changed as a result of the modification
  (e.g., modifying Thursday to cardio might cause Monday to shift from cardio to strength for balance).`,
    schema: ModifyWeekSchema,
  }
);

/**
 * Export all modification tools as an array for use in the agent
 */
export const modificationTools = [
  substituteExerciseTool,
  modifyWorkoutTool,
  modifyWeekTool,
];
