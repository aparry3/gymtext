import { z } from 'zod';
import { type SubstituteExerciseResult, type ModifyWorkoutResult } from '@/server/services/workoutInstanceService';
import { type ModifyWeekResult } from '@/server/services/microcycleService';
import { tool, type StructuredToolInterface } from '@langchain/core/tools';

/**
 * Service interfaces for modification tools (DI)
 */
export interface WorkoutModificationService {
  substituteExercise: (params: SubstituteExerciseParams) => Promise<SubstituteExerciseResult>;
  modifyWorkout: (params: ModifyWorkoutParams) => Promise<ModifyWorkoutResult>;
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
const SubstituteExerciseSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  exercises: z.array(z.string()).describe('List of exercises to replace (e.g., ["Barbell Bench Press", "Squat"])'),
  reason: z
    .string()
    .describe('Reason for the substitution (e.g., "No barbell available", "Shoulder injury")'),
});

type SubstituteExerciseInput = z.infer<typeof SubstituteExerciseSchema>;

// Type exports for service interfaces
export interface SubstituteExerciseParams {
  userId: string;
  workoutDate: Date;
  exercises: string[];
  reason: string;
}


const ModifyWorkoutSchema = z.object({
  userId: z.string().describe('The user ID'),
  workoutDate: z.string().describe('The date of the workout to modify (ISO format)'),
  reason: z.string().describe('Reason for the modification'),
  constraints: z.array(z.string()).describe('List of constraints or modifications needed (e.g., "No gym equipment", "Avoid shoulder exercises", "30 minutes max")'),
  preferredEquipment: z.array(z.string()).nullable().optional().describe('Optional: equipment available (e.g., ["dumbbells", "resistance bands"])'),
  focusAreas: z.array(z.string()).nullable().optional().describe('Optional: specific areas to focus on or avoid'),
});

type ModifyWorkoutInput = z.infer<typeof ModifyWorkoutSchema>;

export interface ModifyWorkoutParams {
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
  changes: string[];
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
  // Tool 1: Substitute Exercise
  const substituteExerciseTool = tool(
    async ({
      userId,
      workoutDate,
      exercises,
      reason,
    }: SubstituteExerciseInput): Promise<SubstituteExerciseResult> => {
      return await deps.workoutService.substituteExercise({
        userId,
        workoutDate: new Date(workoutDate),
        exercises,
        reason,
      });
    },
    {
      name: 'substitute_exercise',
      description: `Substitute a specific exercise or block in the user's current workout.
Use this when the user wants to swap one exercise for another due to equipment limitations,
preferences, or other constraints. This modifies the existing workout in place.`,
      schema: SubstituteExerciseSchema,
    }
  );

  // Tool 2: Modify Workout
  const modifyWorkoutTool = tool(
    async ({ userId, workoutDate, reason, constraints, preferredEquipment, focusAreas }: ModifyWorkoutInput): Promise<ModifyWorkoutResult> => {
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

  // Tool 3: Modify Week
  const modifyWeekTool = tool(
    async ({ userId, targetDay, changes, reason }: ModifyWeekInput): Promise<ModifyWeekResult> => {
      return await deps.microcycleService.modifyWeek({
        userId,
        targetDay,
        changes,
        reason,
      });
    },
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

  return [
    substituteExerciseTool,
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
    substituteExercise: async () => {
      throw new Error('modificationTools is deprecated. Use createModificationTools with dependencies injection instead.');
    },
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
