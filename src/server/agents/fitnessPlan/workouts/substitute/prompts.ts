import { WorkoutInstance } from '@/server/models/workout';
import { LongFormWorkout } from '@/server/models/workout/schema';
import { UserWithProfile } from '@/server/models/userModel';

export interface Modification {
  exercise: string;
  reason: string;
  constraints?: string[];
}

// Step 1: Generate long-form substitution workout description and reasoning
export const longFormPrompt = (
  fitnessProfile: string,
  modifications: Modification[],
  workout: WorkoutInstance,
  user: UserWithProfile
): string => {
  const workoutDetails = typeof workout.details === 'string'
    ? JSON.parse(workout.details)
    : workout.details;

  const modificationsText = modifications.map((mod, idx) => `
${idx + 1}. Exercise to replace: "${mod.exercise}"
   Reason: ${mod.reason}
   ${mod.constraints && mod.constraints.length > 0 ? `Constraints: ${mod.constraints.join(', ')}` : ''}
  `.trim()).join('\n\n');

  return `
You are an expert fitness coach substituting specific exercises in a workout for ${user.name}.

<Task>
Create a comprehensive workout with substitutions, including two components:
1. A detailed workout description with the requested exercise substitutions
2. A thorough coaching rationale explaining the substitutions
</Task>

<Current Workout>
**Original Workout Description:**
${(workout as any).description || 'No description available - see JSON below'}

**Original Coaching Reasoning:**
${(workout as any).reasoning || 'No reasoning available - this workout was generated before we tracked reasoning'}

**Structured Workout JSON:**
${JSON.stringify(workoutDetails, null, 2)}
</Current Workout>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Modifications Required>
${modificationsText}
</Modifications Required>

<Output Format>
Return a JSON object with exactly two fields:
{
  "description": "Long-form workout description with substitutions...",
  "reasoning": "Detailed coaching rationale for substitutions..."
}
</Output Format>

<Description Guidelines>
The "description" field should include (400-600 words):
- Complete workout structure with blocks
- Every exercise with specific names
- For SUBSTITUTED exercises, use the replacement exercise
- For UNCHANGED exercises, keep them exactly as they are
- Sets, reps, rest periods, and RPE targets
- Any supersets or circuits clearly indicated
- Notes on how substitutions integrate with the rest of the workout
- Total estimated duration

**Use fuzzy matching** to find exercises:
- "bench press" matches "Barbell Bench Press"
- "rdl" matches "Romanian Deadlift"
- "db row" matches "Dumbbell Row"

<Reasoning Guidelines>
The "reasoning" field should document ALL decision-making (500-800 words):

**Reference Original Reasoning:**
- Acknowledge the original exercise choice and its reasoning (if available)
- Explain why the substitution is necessary
- Show how the substitute preserves the original intent

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

**User-Specific Considerations:**
- Equipment availability
- Injury or limitation accommodations
- Experience level factors
- Personal preferences

Be thorough - this reasoning will help users understand why these specific substitutions were chosen and how they maintain training effectiveness.

<Critical Rules>
1. PRESERVE the original workout structure completely
2. ONLY modify the exercises explicitly specified in the modifications
3. Keep all other exercises, sets, reps, rest periods, RPE, and notes EXACTLY as they are
4. Support fuzzy matching for exercise names
5. Maintain the same training stimulus as the original exercise
6. Choose replacements that serve the same training purpose

Now create the comprehensive workout with substitutions and reasoning for ${user.name}.
`;
};

// Step 2a: Convert long-form description to structured JSON workout
export const structuredPrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are converting a long-form workout description with exercise substitutions into structured JSON format.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the workout description above into a structured JSON object matching the UpdatedWorkoutInstance schema.
Extract all exercises, sets, reps, rest periods, and organize them into blocks.
Include a "modificationsApplied" array listing all substitutions made.
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
    "Description of each substitution made"
  ]
}
</Schema Requirements>

<modificationsApplied Format>
Each entry should follow the pattern:
"Replaced [original exercise] with [new exercise] in [block name] because [reason]"

Examples:
- "Replaced Barbell Bench Press with Dumbbell Bench Press in Main Block because no barbell available"
- "Replaced Pull-ups with Lat Pulldowns in Upper Block because user cannot yet perform pull-ups"
- "Replaced Squats with Leg Press in Lower Block because knee injury recovery"

Include one entry for each exercise that was substituted.
</modificationsApplied Format>

<Guidelines>
- Preserve exact exercise names from the description
- Extract all sets, reps, rest periods accurately
- Categorize exercises appropriately
- Include all modifications mentioned
- Calculate or estimate target metrics
- Be specific about which exercise was replaced with what

Return ONLY the JSON object - no additional text.
`;

// Step 2b: Convert long-form description to SMS message
export const messagePrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string,
  modifications: Modification[]
) => `
You are an elite personal trainer writing an SMS acknowledgment for exercise substitutions.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
Substitutions requested: ${modifications.map(m => m.exercise).join(', ')}
</User Context>

<Task>
Convert the workout description into a friendly SMS message under 900 characters.
</Task>

<SMS Format Requirements>
- Start with enthusiastic acknowledgment ("Got it!", "Sure thing!", "On it!")
- In ≤1 sentence, briefly mention what you swapped
- Use clear sections: "Warmup:", "Workout:", "Cooldown:"
- List exercises with bullets (-)
- Use SxR format: "3x10" = 3 sets of 10 reps
- Abbreviate: Barbell → BB, Dumbbell → DB
- Keep exercise lines under ~35 characters
- Remove parenthetical details
- End with brief encouraging message (≤1 sentence)
- Total: under 900 characters

<Example>
Got it! I swapped out bench press for DB press in today's workout.

Warmup:
- Band Dislocations: 3x15
- Arm Circles: 2x30 sec

Workout:
- DB Bench Press: 3x8-12
- BB Overhead Press: 3x6-8
- Dips: 3x to failure
- DB Lateral Raises: 3x12-15

Cooldown:
- Chest Stretch: 2 min

You're all set! Let me know how it goes.
</Example>

Return ONLY the SMS message text - no markdown, no extra formatting, no JSON.
`;
