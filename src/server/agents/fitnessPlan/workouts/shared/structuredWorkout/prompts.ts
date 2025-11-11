import type { UserWithProfile } from '@/server/models/userModel';
import type { LongFormWorkout } from '@/server/models/workout/schema';

/**
 * Build static system prompt for structured workout conversion
 * Defines the task, schema requirements, and guidelines
 *
 * @param includeModificationsApplied - Whether to include modificationsApplied field (for substitute/replace)
 * @returns System prompt for structured workout conversion
 */
export function buildStructuredWorkoutSystemPrompt(
  includeModificationsApplied: boolean = false
): string {
  const modificationsAppliedField = includeModificationsApplied
    ? `,
  "modificationsApplied": [
    "Description of each substitution/change made"
  ]`
    : '';

  const modificationsAppliedFormat = includeModificationsApplied
    ? `

<modificationsApplied Format>
Each entry should follow the pattern describing what changed and why.

For substitutions:
"Replaced [original exercise] with [new exercise] in [block name] because [reason]"

For replacements:
"[Change type]: [What changed] - [Why]"

Examples:
- "Replaced Barbell Bench Press with Dumbbell Bench Press in Main Block because no barbell available"
- "Equipment: Replaced Barbell Squat with Goblet Squat - no barbell available"
- "Time: Reduced accessory work from 4 exercises to 2 - 30 minute time constraint"
- "Injury: Replaced Overhead Press with Landmine Press - shoulder injury avoidance"

Include one entry for each significant modification made.
</modificationsApplied Format>`
    : '';

  return `
You are converting a long-form workout description into structured JSON format.

IMPORTANT: Use sentinel values for unset/not-applicable fields:
- Use -1 for numeric fields that don't apply (sets, reps, duration, RPE, rir, percentageRM, restSec, rounds, etc.)
- Use empty string "" for text fields that don't apply (restText, equipment, pattern, tempo, notes, etc.)
- Use empty array [] for array fields with no data (cues, tags, adaptations, etc.)

<Complete Schema Structure>
{
  "theme": "Overall workout theme (e.g., 'Upper Push', 'Lower Strength')",
  "sessionContext": {
    "phaseName": "Training phase name or empty string",
    "weekNumber": number or -1,
    "dayIndex": number or -1,
    "goal": "Session goal or empty string",
    "durationEstimateMin": number or -1,
    "environment": "gym|home or empty string",
    "clientConstraints": {
      "timeAvailable": number or -1,
      "equipmentAvailable": ["equipment1", "equipment2"] or [],
      "injuries": ["injury1"] or [],
      "preferences": ["pref1"] or []
    }
  },
  "blocks": [
    {
      "name": "Block name (e.g., Warm-up & Preparation, Main Lift Block, Accessory / Density Block, Cooldown / Recovery)",
      "goal": "Purpose of this block or empty string",
      "durationMin": estimated minutes or -1,
      "notes": "Block notes or empty string",
      "work": [
        {
          "structureType": "straight|superset|circuit",
          "exercises": [
            {
              "type": "prep|compound|secondary|accessory|core|cardio|cooldown",
              "exercise": "Specific exercise name (e.g., 'Barbell Back Squat', 'Treadmill incline walk')",
              "sets": number or -1,
              "reps": "range like '6-8' or '10' or empty string",
              "durationSec": number or -1,
              "durationMin": number or -1,
              "RPE": number (1-10 scale) or -1,
              "rir": number (Reps in Reserve, typically 0-5) or -1,
              "percentageRM": number (0-100 scale) or -1,
              "restSec": rest in seconds or -1,
              "restText": "human-readable rest like '90s' or '2-3 minutes' or empty string",
              "equipment": "barbell|dumbbell|machine|bodyweight|band|etc or empty string",
              "pattern": "movement pattern like 'squat', 'horizontal_press', 'hip_hinge' or empty string",
              "tempo": "tempo like '3-1-1' or '2-0-1-0' or empty string",
              "cues": ["cue1", "cue2"] or [],
              "tags": ["tag1", "tag2"] or [],
              "notes": "exercise-specific notes or empty string"
            }
          ],
          "restBetweenExercisesSec": number or -1,
          "restAfterSetSec": number or -1,
          "rounds": number or -1,
          "notes": "work item notes or empty string"
        }
      ]
    }
  ],
  "modifications": [
    {
      "condition": "condition description",
      "replace": {"exercise": "exercise name", "with": "replacement name"},
      "adjustment": "adjustment description or empty string",
      "note": "explanation"
    }
  ] or [],
  "targetMetrics": {
    "totalVolume": estimated kg or -1,
    "totalReps": number or -1,
    "totalSets": number or -1,
    "totalDistance": km or -1,
    "totalDuration": minutes or -1,
    "averageRPE": number or -1,
    "averageIntensity": number or -1
  },
  "summary": {
    "adaptations": ["adaptation1", "adaptation2"] or [],
    "coachingNotes": "notes or empty string",
    "progressionNotes": "notes or empty string",
    "recoveryFocus": "focus or empty string"
  },
  "notes": "overall workout notes or empty string"${modificationsAppliedField}
}
</Complete Schema Structure>${modificationsAppliedFormat}

<Guidelines>
CRITICAL: Convert the ENTIRE workout from start to finish. Include ALL blocks and ALL exercises. Do not truncate, skip, or omit any sections regardless of length.

- Preserve exact exercise names from the description
- Extract ALL details: sets, reps, duration, RPE, RIR, percentageRM, rest, equipment, tempo, cues
- Use hierarchical structure: blocks contain work items, work items contain exercises
- Set structureType based on exercise grouping:
  - "straight": single exercise performed for sets
  - "superset": 2 exercises alternated (e.g., push/pull pairing)
  - "circuit": 3+ exercises in sequence
- Categorize exercise types appropriately (prep, compound, secondary, accessory, core, cardio, cooldown)
- For fields without data, use sentinel values: -1 for numbers, "" for strings, [] for arrays
- Calculate or estimate target metrics realistically based on the workout content
- Extract sessionContext details from workout header and context${includeModificationsApplied ? '\n- Be specific about which exercises were substituted/changed and why' : ''}

Return ONLY the JSON object - no additional text.
`.trim();
}

/**
 * Create dynamic user prompt for structured workout conversion
 * Contains the workout data and user context
 *
 * @param longFormWorkout - The long-form workout description and reasoning
 * @param user - User context
 * @param fitnessProfile - Formatted fitness profile string
 * @param includeModificationsApplied - Whether to include modificationsApplied field (for substitute/replace)
 * @returns User prompt for structured workout conversion
 */
export function createStructuredWorkoutUserPrompt(
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string,
  includeModificationsApplied: boolean = false
): string {
  return `
<Long-Form Workout>
${longFormWorkout.workout}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the COMPLETE workout description above into a structured JSON object matching the workout schema.
Include ALL blocks from the beginning to the end of the workout (Warm-up, Main, Accessory, Core, Cool-down, etc.).
Extract all exercises, sets, reps, rest periods, and organize them into blocks.
Do not stop early or truncate any sections - the entire workout must be converted.${includeModificationsApplied ? '\nInclude a "modificationsApplied" array listing all substitutions/changes made.' : ''}
</Task>
`.trim();
}

/**
 * @deprecated Use buildStructuredWorkoutSystemPrompt and createStructuredWorkoutUserPrompt instead
 * Legacy function for backward compatibility
 */
export function createStructuredPrompt(
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string,
  includeModificationsApplied: boolean = false
): string {
  const systemPrompt = buildStructuredWorkoutSystemPrompt(includeModificationsApplied);
  const userPrompt = createStructuredWorkoutUserPrompt(longFormWorkout, user, fitnessProfile, includeModificationsApplied);
  return `${systemPrompt}\n\n${userPrompt}`;
}
