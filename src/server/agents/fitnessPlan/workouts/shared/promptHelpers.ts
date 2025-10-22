/**
 * Shared Workout Prompt Helper Functions
 *
 * This module contains utility functions used across all workout generation agents
 * to compose prompts from shared components and format context data.
 */

import { DateTime } from 'luxon';
import { UserWithProfile } from '@/server/models/userModel';
import { WorkoutInstance } from '@/server/models/workout';
import { LongFormWorkout } from '@/server/models/workout/schema';
import { SMS_FORMAT_REQUIREMENTS, SMS_MESSAGE_EXAMPLES } from './promptComponents';

/**
 * Format recent workouts for inclusion in prompts
 * Returns the SMS messages from the most recent workouts
 * @param workouts - Array of recent workout instances
 * @param timezone - User's timezone for date formatting (kept for backward compatibility)
 * @returns Formatted string with recent workout messages
 */
export function formatRecentWorkouts(workouts: WorkoutInstance[], timezone: string): string {
  if (!workouts || workouts.length === 0) {
    return 'No recent workouts';
  }

  return workouts
    .slice(0, 3) // Last 3 workouts
    .map(w => {
      const dateInUserTz = DateTime.fromJSDate(new Date(w.date)).setZone(timezone);
      const date = dateInUserTz.toLocaleString({ month: 'short', day: 'numeric' });
      const message = w.message || 'No message available';
      return `**${date}:**\n${message}`;
    })
    .join('\n\n');
}

/**
 * Create structured prompt for converting long-form workout to JSON
 * Works for all three agent types (generate, substitute, replace)
 *
 * @param longFormWorkout - The long-form workout description and reasoning
 * @param user - User context
 * @param fitnessProfile - Formatted fitness profile string
 * @param includeModificationsApplied - Whether to include modificationsApplied field (for substitute/replace)
 * @returns Structured prompt for JSON conversion
 */
export function createStructuredPrompt(
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string,
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

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the workout description above into a structured JSON object matching the workout schema.
Extract all exercises, sets, reps, rest periods, and organize them into blocks.${includeModificationsApplied ? '\nInclude a "modificationsApplied" array listing all substitutions/changes made.' : ''}
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
  "notes": "overall workout notes"${modificationsAppliedField}
}
</Schema Requirements>${modificationsAppliedFormat}

<Guidelines>
- Preserve exact exercise names from the description
- Extract all sets, reps, rest periods accurately
- Categorize exercises appropriately (prep, compound, secondary, accessory, core, cardio, cooldown)
- Include all modifications mentioned in the description
- Calculate or estimate target metrics based on the workout
- Capture any overall notes about the workout${includeModificationsApplied ? '\n- Be specific about which exercises were substituted/changed and why' : ''}

Return ONLY the JSON object - no additional text.
`.trim();
}

/**
 * Greeting style for SMS messages
 */
export type GreetingStyle = 'standard' | 'acknowledgment';

/**
 * Create workout-only prompt for converting long-form workout to SMS
 * Generates ONLY the workout content without greetings or motivational messages
 *
 * @param longFormWorkout - The long-form workout description and reasoning
 * @param user - User context
 * @param fitnessProfile - Formatted fitness profile string
 * @returns Message prompt for SMS conversion
 */
export function createWorkoutMessagePrompt(
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
): string {
  return `
You are an elite personal trainer writing an SMS message for workout delivery.

<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

<Task>
Convert the workout description into a concise SMS message containing ONLY the workout structure.
DO NOT include greetings, introductions, or motivational messages.
ONLY include the workout sections: Warmup, Workout, and Cooldown.
Keep under 900 characters.
</Task>

${SMS_FORMAT_REQUIREMENTS}

${SMS_MESSAGE_EXAMPLES}

Return ONLY the SMS message text - no markdown, no extra formatting, no JSON.
`.trim();
}