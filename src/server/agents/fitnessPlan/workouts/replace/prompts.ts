import { WorkoutInstance } from '@/server/models/workout';
import { LongFormWorkout } from '@/server/models/workout/schema';
import { UserWithProfile } from '@/server/models/userModel';

export interface ReplaceWorkoutParams {
  reason: string;
  constraints: string[];
  preferredEquipment?: string[];
  focusAreas?: string[];
}

// Step 1: Generate long-form replacement workout description and reasoning
export const longFormPrompt = (
  fitnessProfile: string,
  params: ReplaceWorkoutParams,
  workout: WorkoutInstance,
  user: UserWithProfile
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

  return `
You are an expert fitness coach replacing a workout based on new constraints for ${user.name}.

<Task>
Create a comprehensive replacement workout with two components:
1. A detailed workout description accommodating all constraints
2. A thorough coaching rationale explaining all changes and decisions
</Task>

<Current Workout>
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

<Output Format>
Return a JSON object with exactly two fields:
{
  "description": "Long-form replacement workout description...",
  "reasoning": "Detailed coaching rationale for all changes..."
}
</Output Format>

<Description Guidelines>
The "description" field should include (400-600 words):
- Complete replacement workout structure with blocks
- Every exercise with specific names (never vague terms)
- Sets, reps, rest periods, and RPE targets
- Any supersets or circuits clearly indicated
- Notes on how this replaces the original workout
- How constraints are accommodated
- Total estimated duration

Preserve the original workout's training intent as much as possible while accommodating constraints.

<Reasoning Guidelines>
The "reasoning" field should document ALL decision-making (500-800 words):

**Constraint Handling:**
- How each specific constraint was addressed
- Why certain exercises were replaced or modified
- Trade-offs made to accommodate limitations
- How training stimulus was preserved despite constraints

**Exercise Selection:**
- Why replacement exercises were chosen
- How they maintain similar movement patterns
- Muscle group targeting compared to original
- Intensity and volume adjustments

**Training Intent Preservation:**
- What aspects of the original workout were kept
- What had to change and why
- How the replacement maintains program progression
- Impact on overall training plan

**User-Specific Adaptations:**
- Equipment availability considerations
- Time constraint management
- Injury or limitation accommodations
- Experience level factors

**Modifications Applied:**
- Specific changes made (list each one)
- Why each change was necessary
- How each change maintains effectiveness

Be thorough - this reasoning will help users understand why their workout changed and that it's still effective for their goals.

<Critical Rules>
1. PRESERVE the original workout's training intent and structure as much as possible
2. Apply ALL specified constraints
3. Maintain similar training stimulus and progression
4. Only make changes necessary to accommodate constraints
5. Keep similar volume and intensity where possible

Now create the comprehensive replacement workout and reasoning for ${user.name}.
`;
};

// Step 2a: Convert long-form description to structured JSON workout
export const structuredPrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are converting a long-form replacement workout description into structured JSON format.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the replacement workout description above into a structured JSON object matching the UpdatedWorkoutInstance schema.
Extract all exercises, sets, reps, rest periods, and organize them into blocks.
Include a "modificationsApplied" array listing all changes made.
</Task>

<Schema Requirements>
{
  "theme": "workout theme from description",
  "blocks": [
    {
      "name": "Block name",
      "items": [
        {
          "type": "prep|compound|secondary|accessory|core|cardio|cooldown",
          "exercise": "Exact exercise name from description",
          "sets": number or null,
          "reps": "number or range" or null,
          "durationSec": number or null,
          "durationMin": number or null,
          "RPE": number (1-10) or null,
          "rest": "rest period string" or null,
          "notes": "any exercise-specific notes" or null
        }
      ]
    }
  ],
  "modifications": [
    {
      "condition": "condition triggering modification",
      "replace": {
        "exercise": "exercise to replace",
        "with": "replacement exercise"
      },
      "note": "explanation"
    }
  ],
  "targetMetrics": {
    "totalVolume": estimated total volume,
    "totalDuration": estimated duration in minutes,
    "averageIntensity": average RPE
  },
  "notes": "overall workout notes",
  "modificationsApplied": [
    "Description of each change made (e.g., 'Equipment: Replaced Barbell Squat with Goblet Squat - no barbell available')"
  ]
}
</Schema Requirements>

<modificationsApplied Format>
Each entry should follow the pattern:
- "[Change type]: [What changed] - [Why]"

Examples:
- "Equipment: Replaced Barbell Bench Press with Dumbbell Bench Press - no barbell available"
- "Time: Reduced accessory work from 4 exercises to 2 - 30 minute time constraint"
- "Injury: Replaced Overhead Press with Landmine Press - shoulder injury avoidance"
- "Structure: Combined warmup and main block - time efficiency"

Include one entry for each significant modification made to the original workout.
</modificationsApplied Format>

<Guidelines>
- Preserve exact exercise names from the description
- Extract all sets, reps, rest periods accurately
- Categorize exercises appropriately
- Include all modifications mentioned
- Calculate or estimate target metrics
- Be specific and comprehensive in modificationsApplied array

Return ONLY the JSON object - no additional text.
`;

// Step 2b: Convert long-form description to SMS message
export const messagePrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string,
  reason: string
) => `
You are an elite personal trainer writing an SMS acknowledgment for a modified workout.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
Reason for modification: ${reason}
</User Context>

<Task>
Convert the replacement workout description into a friendly SMS message under 900 characters.
</Task>

<SMS Format Requirements>
- Start with enthusiastic acknowledgment ("Sure thing!", "Got it!", "On it!")
- In ≤1 sentence, briefly explain what you did
- Use clear sections: "Warmup:", "Workout:", "Cooldown:"
- List exercises with bullets (-)
- Use SxR format: "3x10" = 3 sets of 10 reps
- Abbreviate: Barbell → BB, Dumbbell → DB
- Keep exercise lines under ~35 characters
- Remove parenthetical details
- End with brief encouraging message (≤1 sentence)
- Total: under 900 characters

<Example>
Sure thing! Modified today's workout for home equipment.

Warmup:
- Arm Circles: 2x20 sec
- Cat-Cow Stretch: 2x10

Workout:
- Push-ups: 3x15-20
- DB Rows: 3x12-15
- Pike Push-ups: 3x10-12
- DB Bicep Curls: 3x12-15

Cooldown:
- Shoulder Stretch: 1 min

Short and sweet! You got this.
</Example>

Return ONLY the SMS message text - no markdown, no extra formatting, no JSON.
`;
