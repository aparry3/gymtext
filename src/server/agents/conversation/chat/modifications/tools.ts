import { z } from 'zod';
import { workoutInstanceService } from '@/server/services/workoutInstanceService';
import { microcycleService } from '@/server/services/microcycleService';
import { tool } from '@langchain/core/tools';

const SubstituteExerciseSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  exerciseToReplace: z.string().describe('The name of the exercise to replace'),
  replacementExercise: z
    .string()
    .optional()
    .describe('Optional: specific exercise to replace it with. If not provided, the AI will suggest alternatives.'),
  reason: z
    .string()
    .describe('Reason for the substitution (e.g., "No barbell available", "Shoulder injury")'),
  blockName: z.string().optional().describe('Optional: name of the block containing the exercise'),
});

type SubstituteExerciseInput = z.infer<typeof SubstituteExerciseSchema>;

const substituteFunction = async ({
  userId,
  workoutDate,
  exerciseToReplace,
  replacementExercise,
  reason,
  blockName,
}: SubstituteExerciseInput): Promise<string> => {
  const result = await workoutInstanceService.substituteExercise({
    userId,
    workoutDate: new Date(workoutDate),
    exerciseToReplace,
    replacementExercise,
    reason,
    blockName,
  });

  if (result.success) {
    return `Successfully replaced "${exerciseToReplace}" with "${result.replacementExercise}". ${result.message || ''}`.trim();
  }
  return `Failed to substitute exercise: ${result.error}`;
};

export const substituteExerciseTool = tool(substituteFunction, {
  name: 'substitute_exercise',
  description: `Substitute a specific exercise or block in the user's current workout.
Use this when the user wants to swap one exercise for another due to equipment limitations,
preferences, or other constraints. This modifies the existing workout in place.`,
  schema: SubstituteExerciseSchema,
});


const ModifyWorkoutSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  constraints: z.array(z.string()).describe('List of constraints or modifications needed (e.g., "No gym equipment", "Avoid shoulder exercises", "30 minutes max")'),
  preferredEquipment: z.array(z.string()).optional().describe('Optional: equipment available (e.g., ["dumbbells", "resistance bands"])'),
  focusAreas: z.array(z.string()).optional().describe('Optional: specific areas to focus on or avoid'),
});

type ModifyWorkoutInput = z.infer<typeof ModifyWorkoutSchema>;

const modifyWorkoutFunction = async ({ userId, workoutDate, constraints, preferredEquipment, focusAreas }: ModifyWorkoutInput): Promise<string> => {
  const result = await workoutInstanceService.modifyWorkout({
    userId,
    workoutDate: new Date(workoutDate),
    constraints,
    preferredEquipment,
    focusAreas,
  });

  if (result.success) {
    return `Successfully generated modified workout. ${result.message || ''} The workout has been updated with ${result.workout?.blocks.length || 0} blocks.`;
  } else {
    return `Failed to modify workout: ${result.error}`;
  }
}
/**
 * Tool for modifying the entire workout
 * Use this when the user needs a completely different workout or significant changes
 * Example: "I can't make it to the gym today, can I get a home workout instead?"
 */
export const modifyWorkoutTool = tool(modifyWorkoutFunction, {
  name: 'modify_workout',
  description: `Generate a modified version of the user's workout for today. Use this when the user needs
  significant changes to their workout due to equipment limitations, injuries, time constraints, or other factors.
  This regenerates the entire workout while maintaining training principles.`,
  schema: ModifyWorkoutSchema,
});

const ModifyWeekSchema = z.object({
  userId: z.string().describe('The user ID'),
  startDate: z.string().describe('Start date of the week to modify (ISO format)'),
  modifications: z.array(z.object({
    day: z.string().describe('Day of the week (e.g., "Monday", "Tuesday")'),
    change: z.string().describe('What change to make (e.g., "Skip", "Make it a home workout", "Light recovery only")'),
  })).describe('Modifications for specific days of the week'),
  constraints: z.array(z.string()).describe('Overall constraints for the week (e.g., "No gym access", "Only 30 min per day")'),
  reason: z.string().describe('Reason for the weekly modification'),
});

type ModifyWeekInput = z.infer<typeof ModifyWeekSchema>;

const modifyWeekFunction = async ({ userId, startDate, modifications, constraints, reason }: ModifyWeekInput): Promise<string> => {
  const result = await microcycleService.modifyWeek({
    userId,
    startDate: new Date(startDate),
    modifications,
    constraints,
    reason,
  });

  if (result.success) {
    return `Successfully modified the week starting ${startDate}. ${result.message || ''} Updated ${result.modifiedDays || 0} days.`;
  } else {
    return `Failed to modify week: ${result.error}`;
  }
}
/**
 * Tool for modifying the weekly training pattern
 * Use this when the user needs to adjust their training for the entire week
 * Example: "I'm traveling this week and won't have access to a gym"
 */
export const modifyWeekTool = tool(modifyWeekFunction, {
  name: 'modify_week',
  description: `Modify the user's training pattern for the current or upcoming week. Use this when the user
  needs to adjust their entire week of training due to travel, schedule changes, equipment limitations,
  or other factors that affect multiple days. This updates the microcycle pattern and regenerates workouts.`,
  schema: ModifyWeekSchema,
});

/**
 * Export all modification tools as an array for use in the agent
 */
export const modificationTools = [
  substituteExerciseTool,
  modifyWorkoutTool,
  modifyWeekTool,
];
