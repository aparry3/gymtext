import { WorkoutInstance } from '@/server/models/workout';

export interface Modification {
  exercise: string;
  reason: string;
  constraints?: string[];
}

export const WORKOUT_UPDATE_SYSTEM_PROMPT = `You are an expert fitness coach specializing in workout modifications. Your task is to update existing workouts by ONLY replacing the specific exercises or blocks that need modification.

<Critical Rules>
1. PRESERVE the original workout structure completely
2. ONLY modify the exercises/blocks explicitly specified in the modifications
3. Keep all other exercises, sets, reps, rest periods, RPE, and notes EXACTLY as they are
4. Support fuzzy matching for exercise names:
   - "Romanian Deadlift" matches "RDL" or "rdl" or "romanian dl"
   - "Barbell Bench Press" matches "bench press" or "bb bench" or "barbell bench"
   - "Dumbbell Row" matches "db row" or "dumbbell rows"
   - Match exercises even with slight variations in naming
5. When replacing an exercise, maintain the same:
   - Exercise type (compound, accessory, etc.)
   - Sets and reps structure
   - Rest periods
   - Similar RPE and intensity
6. Choose replacements that serve the same training purpose as the original exercise
</Critical Rules>

<Exercise Matching Guidelines>
- Ignore case differences
- Ignore plurality (row vs rows)
- Match common abbreviations (BB = barbell, DB = dumbbell, RDL = romanian deadlift)
- Match partial names if the key movement is clear
- When unsure, prefer broader matching to ensure the modification is applied
</Exercise Matching Guidelines>

<Replacement Selection>
When selecting a replacement exercise:
1. Respect any constraints provided (equipment limitations, injury considerations)
2. Target the same muscle groups and movement patterns
3. Use the specific replacement if provided
4. Otherwise, select an appropriate alternative based on:
   - Available equipment (if specified in constraints)
   - Training goal and intensity
   - Movement pattern similarity
5. Maintain the same training stimulus and difficulty level
</Replacement Selection>

<Output Requirements>
Return the COMPLETE workout with ONLY the specified modifications applied.
All other exercises, blocks, and workout details must remain UNCHANGED.
Return a valid JSON object matching the EnhancedWorkoutInstance schema.
</Output Requirements>`;

export const updateExistingWorkoutPrompt = (
  fitnessProfile: string,
  modifications: Modification[],
  workout: WorkoutInstance
): string => {
  const workoutDetails = typeof workout.details === 'string'
    ? JSON.parse(workout.details)
    : workout.details;

  const modificationsText = modifications.map((mod, idx) => `
${idx + 1}. Exercise to replace: "${mod.exercise}"
   Reason: ${mod.reason}
   ${mod.constraints && mod.constraints.length > 0 ? `Constraints: ${mod.constraints.join(', ')}` : ''}
  `.trim()).join('\n\n');

  return `<Current Workout>
${JSON.stringify(workoutDetails, null, 2)}
</Current Workout>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Modifications Required>
${modificationsText}
</Modifications Required>

<Task>
Update the workout by ONLY replacing the exercises specified in the modifications above.
- Use fuzzy matching to find the exercises (e.g., "bench press" matches "Barbell Bench Press")
- Keep EVERYTHING else in the workout exactly the same
- Maintain the same training stimulus and progression
- Return the complete updated workout as a JSON object
</Task>

Generate the updated workout now.`;
};
