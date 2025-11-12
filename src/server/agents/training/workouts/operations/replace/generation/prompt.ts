import { WorkoutInstance } from '@/server/models/workout';
import {
  OUTPUT_FORMAT_SECTION,
  buildDescriptionGuidelines,
  buildReasoningGuidelines,
} from '../../../shared/promptComponents';
import { ReplaceWorkoutContext } from '../chain';

export interface ReplaceWorkoutParams {
  reason: string;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}


// System prompt - static instructions and guidelines
export const SYSTEM_PROMPT = `
You are an expert fitness coach replacing a workout based on new constraints.

<Task>
Create a comprehensive replacement workout with two components:
1. A detailed workout description accommodating all constraints
2. A thorough coaching rationale explaining all changes and decisions
</Task>

${OUTPUT_FORMAT_SECTION}

${buildDescriptionGuidelines("400-600")}

Preserve the original workout's training intent as much as possible while accommodating constraints.

${buildReasoningGuidelines("500-800", true)}

**Constraint Handling:**
- How each specific constraint was addressed
- Why certain exercises were replaced or modified
- Trade-offs made to accommodate limitations
- How training stimulus was preserved despite constraints

**Exercise Selection:**
- Why replacement exercises were chosen
- How they maintain similar movement patterns (reference original reasoning)
- Muscle group targeting compared to original
- Intensity and volume adjustments

**Training Intent Preservation:**
- What aspects of the original workout were kept (reference original description/reasoning)
- What had to change and why
- How the replacement maintains program progression
- Impact on overall training plan

**Modifications Applied:**
- Specific changes made (list each one)
- Why each change was necessary
- How each change maintains effectiveness

<Critical Rules>
1. PRESERVE the original workout's training intent and structure as much as possible
2. Apply ALL specified constraints
3. Maintain similar training stimulus and progression
4. Only make changes necessary to accommodate constraints
5. Keep similar volume and intensity where possible
`.trim();

// User prompt - dynamic context and user-specific data
export const userPrompt = (
 input: ReplaceWorkoutContext
) => (fitnessProfile: string) => {
  const workoutDetails = typeof input.workout.details === 'string'
    ? JSON.parse(input.workout.details)
    : input.workout.details;

  const constraintsText = input.params.constraints.map((c, idx) => `${idx + 1}. ${c}`).join('\n');
  const equipmentText = input.params.preferredEquipment?.length
    ? `Available equipment: ${input.params.preferredEquipment.join(', ')}`
    : 'No specific equipment preferences provided';
  const focusText = input.params.focusAreas?.length
    ? `Focus areas: ${input.params.focusAreas.join(', ')}`
    : 'No specific focus areas';

  return `
User: ${input.user.name}

Current Workout:
**Original Workout Description:**
${(input.workout as WorkoutInstance & { description?: string }).description || 'No description available - see JSON below'}

**Original Coaching Reasoning:**
${(input.workout as WorkoutInstance & { reasoning?: string }).reasoning || 'No reasoning available - this workout was generated before we tracked reasoning'}

**Structured Workout JSON:**
${JSON.stringify(workoutDetails, null, 2)}

Fitness Profile:
${fitnessProfile}

Modification Request:
Reason: ${input.params.reason}

Constraints:
${constraintsText}

${equipmentText}
${focusText}

Now create the comprehensive replacement workout and reasoning for ${input.user.name}.
`.trim();
};
