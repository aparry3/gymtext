import { WorkoutInstance } from '@/server/models/workout';
import { LongFormWorkout } from '@/server/models/workout/schema';
import { UserWithProfile } from '@/server/models/userModel';
import {
  OUTPUT_FORMAT_SECTION,
  buildDescriptionGuidelines,
  buildReasoningGuidelines,
} from '../shared/promptComponents';
import {
  createStructuredPrompt,
} from '../shared/promptHelpers';

export interface Modification {
  exercise: string;
  reason: string;
  constraints?: string[];
}

// System prompt - static instructions and guidelines
export const systemPrompt = () => `
You are an expert fitness coach substituting specific exercises in a workout.

<Task>
Create a comprehensive workout with substitutions, including two components:
1. A detailed workout description with the requested exercise substitutions
2. A thorough coaching rationale explaining the substitutions
</Task>

${OUTPUT_FORMAT_SECTION}

${buildDescriptionGuidelines("400-600")}

**Use fuzzy matching** to find exercises:
- "bench press" matches "Barbell Bench Press"
- "rdl" matches "Romanian Deadlift"
- "db row" matches "Dumbbell Row"

${buildReasoningGuidelines("500-800", true)}

**Exercise Substitution Rationale:**
- Why each specific exercise was replaced
- How the replacement maintains similar:
  * Movement patterns (reference original reasoning if applicable)
  * Muscle groups targeted
  * Training stimulus
  * Intensity and volume

**Constraint Handling:**
- How constraints (equipment, injury, preference) were addressed
- Trade-offs made in selecting replacements
- Why the chosen replacement is optimal given constraints

**Training Intent Preservation:**
- How substitutions maintain the original workout's goals (reference original description/reasoning)
- Impact on overall workout effectiveness
- Why the workout remains effective despite changes

**Integration:**
- How substituted exercises fit with unchanged exercises
- Balance and flow of the modified workout
- Adjustments to sets/reps/rest if needed for substitutions

<Critical Rules>
1. PRESERVE the original workout structure completely
2. ONLY modify the exercises explicitly specified in the modifications
3. Keep all other exercises, sets, reps, rest periods, RPE, and notes EXACTLY as they are
4. Support fuzzy matching for exercise names
5. Maintain the same training stimulus as the original exercise
6. Choose replacements that serve the same training purpose
`.trim();

// User prompt - dynamic context and user-specific data
export const userPrompt = (
  fitnessProfile: string,
  modifications: Modification[],
  workout: WorkoutInstance,
  user: UserWithProfile
) => {
  const workoutDetails = typeof workout.details === 'string'
    ? JSON.parse(workout.details)
    : workout.details;

  const modificationsText = modifications.map((mod, idx) => `
${idx + 1}. Exercise to replace: "${mod.exercise}"
   Reason: ${mod.reason}
   ${mod.constraints && mod.constraints.length > 0 ? `Constraints: ${mod.constraints.join(', ')}` : ''}
  `.trim()).join('\n\n');

  return `
User: ${user.name}

Current Workout:
**Original Workout Description:**
${(workout as WorkoutInstance & { description?: string }).description || 'No description available - see JSON below'}

**Original Coaching Reasoning:**
${(workout as WorkoutInstance & { reasoning?: string }).reasoning || 'No reasoning available - this workout was generated before we tracked reasoning'}

**Structured Workout JSON:**
${JSON.stringify(workoutDetails, null, 2)}

Fitness Profile:
${fitnessProfile}

Modifications Required:
${modificationsText}

Now create the comprehensive workout with substitutions and reasoning for ${user.name}.
`.trim();
};

// Step 2a: Convert long-form description to structured JSON workout
export const structuredPrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => createStructuredPrompt(longFormWorkout, user, fitnessProfile, true);
