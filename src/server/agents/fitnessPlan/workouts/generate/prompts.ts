import { UserWithProfile } from '@/server/models/userModel';
import { MicrocyclePattern } from '@/server/models/microcycle';
import { MesocycleOverview } from '@/server/models/fitnessPlan';
import { WorkoutInstance } from '@/server/models/workout';
import { DateTime } from 'luxon';
import { LongFormWorkout } from '@/server/models/workout/schema';

// Step 1: Generate long-form workout description and reasoning
export const longFormPrompt = (
  user: UserWithProfile,
  fitnessProfile: string,
  dayPlan: {
    day: string;
    theme: string;
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  },
  microcycle: MicrocyclePattern,
  mesocycle: MesocycleOverview,
  programType: string,
  recentWorkouts?: WorkoutInstance[]
) => `
You are an elite personal fitness coach creating today's workout for ${user.name}.

<Task>
Create a comprehensive workout with two components:
1. A detailed workout description with all exercises, sets, reps, structure, and supersets
2. A thorough coaching rationale explaining all decisions
</Task>

<Context>
- Program type: ${programType}
- Current mesocycle: ${mesocycle.name} (week ${microcycle.weekIndex} of ${mesocycle.weeks})
- Mesocycle focus: ${mesocycle.focus.join(', ')}
- Today's theme: ${dayPlan.theme}
- Load level: ${dayPlan.load || 'moderate'}
${dayPlan.notes ? `- Special notes: ${dayPlan.notes}` : ''}
${mesocycle.deload && microcycle.weekIndex === mesocycle.weeks ? '- This is a DELOAD week - reduce volume and intensity' : ''}
</Context>

<Recent Training History>
${recentWorkouts && recentWorkouts.length > 0 ? formatRecentWorkouts(recentWorkouts, user.timezone) : 'No recent workouts available'}
</Recent Training History>

<Fitness Profile>
${fitnessProfile}
</Fitness Profile>

<Output Format>
Return a JSON object with exactly two fields:
{
  "description": "Long-form workout description...",
  "reasoning": "Detailed coaching rationale..."
}
</Output Format>

<Description Guidelines>
The "description" field should include (400-600 words):
- Complete workout structure with blocks (Warm-up, Main, Accessory, Cool-down)
- Every exercise with specific names (e.g., "Band Pull-Aparts", "BB Back Squat", "DB RDL")
- Sets, reps, and rest periods for each exercise
- Any supersets or circuits clearly indicated
- RPE targets for key exercises
- Notes on modifications for injuries/limitations
- Total estimated duration

**CRITICAL: Exercise Naming**
Every exercise MUST be specific and actionable:
- GOOD: "Band Pull-Aparts", "Cat-Cow Stretch", "BB Deadlifts"
- BAD: "Shoulder mobility sequence", "Dynamic warmup", "Core work"

<Reasoning Guidelines>
The "reasoning" field should document ALL decision-making (500-800 words):

**Exercise Selection:**
- Why these specific exercises were chosen
- How they align with today's theme (${dayPlan.theme})
- How they fit into the mesocycle focus (${mesocycle.focus.join(', ')})
- Connection to user's primary goals

**Progressive Overload:**
- How this workout builds on recent training
- Volume/intensity decisions based on where we are in the mesocycle
- Why this specific load level (${dayPlan.load || 'moderate'})

**User-Specific Adaptations:**
- How workout accounts for equipment availability
- Schedule constraints and time management
- Previous injuries or limitations addressed
- Experience level considerations

**Program Integration:**
- How this workout advances the overall ${programType} program
- Placement within ${mesocycle.name} mesocycle strategy
- Balance with other training days this week

**Modifications:**
- Why certain modifications are included
- How alternatives maintain training stimulus
- Safety considerations

Be thorough - this reasoning will be referenced when users ask "why this exercise?" or "how does this help my goal?"

<Example Output Structure>
{
  "description": "Today's Upper Push workout focuses on building pressing strength and shoulder development.

Warm-up (10 min):
- Band Pull-Aparts: 3x15 (scapular activation)
- Scapular Wall Slides: 3x12 (shoulder mobility)
- Cat-Cow Stretch: 2x10 (thoracic spine mobility)
- Arm Circles: 2x30 sec each direction (dynamic shoulder prep)
- Light DB Press: 2x12 at 50% working weight (movement prep)

Main Block (35 min):
Superset A (4 rounds, 2 min rest):
- BB Bench Press: 4x6-8 at RPE 8 (primary pressing strength)
- DB Rows: 4x8-10 at RPE 7 (antagonist work for shoulder health)

Superset B (3 rounds, 90 sec rest):
- DB Incline Press: 3x10-12 at RPE 7 (upper chest development)
- DB Face Pulls: 3x15-20 at RPE 6 (rear delt and rotator cuff)

Accessory Block (15 min):
- Overhead Press: 3x8-10 at RPE 7
- Lateral Raises: 3x12-15 at RPE 6
- Tricep Pushdowns: 3x15-20 at RPE 6

Cool-down (5 min):
- Chest Doorway Stretch: 2 min total
- Shoulder Stretch: 2 min total
- Deep Breathing: 1 min

Total Duration: ~65 minutes
Modifications: If experiencing any shoulder discomfort, replace BB Bench with DB Bench Press for more natural shoulder positioning.",

  "reasoning": "Exercise Selection Rationale: The BB Bench Press is programmed as the primary lift because we're in week 2 of the Strength Development mesocycle, and the user has shown good pressing technique in recent sessions. The 4x6-8 rep scheme targets strength adaptation while maintaining quality volume. I paired this with DB Rows in a superset to manage fatigue and maintain shoulder health through balanced pushing/pulling...[continues with comprehensive explanation of every decision made, relating back to user's goals, program phase, equipment, schedule, and profile]"
}
</Example Output Structure>

Now create the comprehensive workout and reasoning for ${user.name}.
`;

// Step 2a: Convert long-form description to structured JSON workout
export const structuredPrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are converting a long-form workout description into structured JSON format.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the workout description above into a structured JSON object matching the EnhancedWorkoutInstance schema.
Extract all exercises, sets, reps, rest periods, and organize them into blocks.
</Task>

<Schema Requirements>
{
  "theme": "workout theme from description",
  "blocks": [
    {
      "name": "Block name (e.g., Warm-up, Main, Accessory, Cool-down)",
      "items": [
        {
          "type": "exercise type: prep|compound|secondary|accessory|core|cardio|cooldown",
          "exercise": "Exact exercise name from description",
          "sets": number or null,
          "reps": "number or range (e.g., '6-8', '10')" or null,
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
    "averageIntensity": average RPE across workout
  },
  "notes": "overall workout notes"
}
</Schema Requirements>

<Guidelines>
- Preserve exact exercise names from the description
- Extract all sets, reps, rest periods accurately
- Categorize exercises appropriately (prep, compound, secondary, accessory, core, cardio, cooldown)
- Include all modifications mentioned in the description
- Calculate or estimate target metrics based on the workout
- Capture any overall notes about the workout

Return ONLY the JSON object - no additional text.
`;

// Step 2b: Convert long-form description to SMS message
export const messagePrompt = (
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
) => `
You are an elite personal trainer writing an SMS message for workout delivery.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the workout description into a friendly SMS message under 900 characters.
</Task>

<SMS Format Requirements>
- Start with a brief greeting using ${user.name}'s first name
- In ≤1 sentence, connect to a key goal from the profile
- Use clear sections: "Warmup:", "Workout:", "Cooldown:"
- List exercises with bullets (-)
- Use SxR format: "3x10" = 3 sets of 10 reps, "3x6-8" = 3 sets of 6-8 reps
- Abbreviate: Barbell → BB, Dumbbell → DB
- Keep exercise lines under ~35 characters for mobile readability
- Remove parenthetical details and extra descriptions
- End with brief motivational message (≤1 sentence)
- Total: under 900 characters

<Example>
Back building day! Let's build that barn door.

Warmup:
- Band Pull-Aparts: 3x15
- Scapular Wall Slides: 3x12
- Cat-Cow Stretch: 2x10

Workout:
- BB Deadlifts: 4x6-8
- Pull-ups: 3x to failure
- BB Rows: 3x8-10
- Seated Cable Rows: 3x10-15
- Hanging Leg Raises: 3x15-20

Cooldown:
- Lat Stretch: 2 min
- Lower Back Stretch: 2 min

Focus on form and controlled movements. Let me know if you need any modifications!
</Example>

Return ONLY the SMS message text - no markdown, no extra formatting, no JSON.
`;

function formatRecentWorkouts(workouts: WorkoutInstance[], timezone: string): string {
  if (!workouts || workouts.length === 0) {
    return 'No recent workouts';
  }

  return workouts
    .slice(0, 3) // Last 3 workouts
    .map(w => {
      const dateInUserTz = DateTime.fromJSDate(new Date(w.date)).setZone(timezone);
      const date = dateInUserTz.toLocaleString({ month: 'short', day: 'numeric', year: 'numeric' });
      const sessionType = w.sessionType;
      const goal = w.goal || 'No specific goal';
      return `- ${date}: ${sessionType} (${goal})`;
    })
    .join('\n');
}
