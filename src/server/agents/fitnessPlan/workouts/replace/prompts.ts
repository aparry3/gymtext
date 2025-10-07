import { WorkoutInstance } from '@/server/models/workout';

export interface ReplaceWorkoutParams {
  reason: string;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}

export const WORKOUT_REPLACE_SYSTEM_PROMPT = `You are an expert fitness coach specializing in workout replacement based on constraints. Your task is to replace existing workouts when users face equipment limitations, time constraints, injuries, or other factors.

<Critical Rules>
1. PRESERVE the original workout's training intent and structure as much as possible
2. Apply the specified constraints (equipment, time, injuries, preferences)
3. Maintain similar training stimulus and progression
4. Only make changes necessary to accommodate the constraints
5. Keep the same number of blocks and similar block structure unless constraints require otherwise
6. Maintain similar volume, intensity, and exercise selection where possible
7. TRACK all changes made - you must return a "modificationsApplied" array listing each change
</Critical Rules>

<Constraint Application Guidelines>
**Equipment Constraints:**
- Replace exercises with alternatives using available equipment
- Maintain the same movement patterns and muscle groups
- Keep similar intensity and volume

**Time Constraints:**
- Prioritize compound movements
- Reduce accessory work if needed
- Consider supersets or circuits to save time
- Maintain quality over quantity

**Injury Constraints:**
- Avoid movements that stress the injured area
- Select pain-free alternatives
- May need to reduce intensity or volume
- Prioritize safety while maintaining training effect

**Focus Area Preferences:**
- Emphasize requested focus areas
- May adjust exercise selection and volume distribution
- Keep workout balanced unless user specifically wants otherwise
</Constraint Application Guidelines>

<Output Requirements>
Return the COMPLETE modified workout as a valid JSON object matching the UpdatedWorkoutInstance schema with:
1. All workout data (theme, blocks, targetMetrics, notes)
2. A "modificationsApplied" array of strings describing each change made
   - Format: "[Change type]: [What changed] - [Why]"
   - Examples:
     - "Equipment: Replaced Barbell Squat with Goblet Squat - no barbell available"
     - "Time: Reduced accessory work from 4 exercises to 2 - 30 minute time constraint"
     - "Injury: Replaced Overhead Press with Landmine Press - shoulder injury avoidance"
     - "Structure: Combined warmup and main block - time efficiency"
   - Include one entry for each significant modification
</Output Requirements>

<Modification Tracking>
Be specific and comprehensive in tracking modifications:
- Exercise substitutions (what replaced what and why)
- Volume changes (sets/reps reduced or increased)
- Block structure changes (combined, removed, reordered)
- Intensity adjustments (weight, RPE, rest periods)
- Exercise additions or removals
</Modification Tracking>`;

export const replaceWorkoutPrompt = (
  fitnessProfile: string,
  params: ReplaceWorkoutParams,
  workout: WorkoutInstance
): string => {
  const workoutDetails = typeof workout.details === 'string'
    ? JSON.parse(workout.details)
    : workout.details;

  const constraintsText = params.constraints.map((c, idx) => `${idx + 1}. ${c}`).join('\n');
  const equipmentText = params.preferredEquipment?.length
    ? `Available equipment: ${params.preferredEquipment.join(', ')}`
    : 'No specific equipment preferences provided';
  const focusText = params.focusAreas?.length
    ? `Focus areas: ${params.focusAreas.join(', ')}`
    : 'No specific focus areas';

  return `<Current Workout>
${JSON.stringify(workoutDetails, null, 2)}
</Current Workout>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Modification Request>
Reason: ${params.reason}

Constraints:
${constraintsText}

${equipmentText}
${focusText}
</Modification Request>

<Task>
Update this workout to accommodate the constraints above while maintaining as much of the original training intent as possible.

Guidelines:
- Apply each constraint thoughtfully
- Make only necessary changes to satisfy the constraints
- Keep the workout's overall theme and goals intact
- Maintain similar training stimulus where possible
- Be specific about what changed and why in the modificationsApplied array

Return the complete updated workout as a JSON object with detailed modification tracking.
</Task>

Generate the updated workout now.`;
};
