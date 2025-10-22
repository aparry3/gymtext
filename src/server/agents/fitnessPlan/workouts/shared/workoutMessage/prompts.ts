import type { UserWithProfile } from '@/server/models/userModel';
import type { LongFormWorkout } from '@/server/models/workout/schema';
import { SMS_FORMAT_REQUIREMENTS, SMS_MESSAGE_EXAMPLES } from '../promptComponents';

/**
 * Static system prompt for workout SMS message generation
 * Defines the role, task, format requirements, and examples
 */
export const WORKOUT_MESSAGE_SYSTEM_PROMPT = `
You are an elite personal trainer writing an SMS message for workout delivery.

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

/**
 * Create dynamic user prompt for workout SMS message generation
 * Contains the specific workout description and user context
 *
 * @param longFormWorkout - The long-form workout description and reasoning
 * @param user - User context
 * @param fitnessProfile - Formatted fitness profile string
 * @returns User prompt for SMS conversion
 */
export function createWorkoutMessageUserPrompt(
  longFormWorkout: LongFormWorkout,
  user: UserWithProfile,
  fitnessProfile: string
): string {
  return `
<Long-Form Workout>
${longFormWorkout.description}
</Long-Form Workout>

<User Context>
Name: ${user.name}
Fitness Profile: ${fitnessProfile}
</User Context>

Convert this workout into an SMS message following the format requirements and examples provided.
`.trim();
}
