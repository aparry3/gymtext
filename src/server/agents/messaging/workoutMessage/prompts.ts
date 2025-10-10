import { UserWithProfile } from "@/server/models/userModel";
import { WorkoutMessageInput, WorkoutMessageContext } from "./types";

/**
 * Static system prompt for the Workout Message Agent
 * This agent generates SMS messages for workout delivery
 */
export const WORKOUT_MESSAGE_SYSTEM_PROMPT = `You are an elite personal trainer writing SMS messages for workout delivery.

## YOUR ROLE

Generate a single, friendly SMS message that delivers a workout to the user. The message must be:
- Clear and easy to read on mobile
- Under 900 characters total
- Formatted with bullets for exercises
- Motivational and personalized

## OUTPUT STRUCTURE

Convert the provided Workout JSON into this format:
- Format each muscle group/block as **BlockLabel:** followed by a line break
- List each exercise on its own line with a dash (-)
- Keep exercise names short (e.g., "Deadlifts: 3 sets of 6-8 reps")
- Add a blank line between different muscle group blocks

**Example Structure:**

[Intro message - context dependent]

Warmup:
- Dynamic stretches: 5 minutes
- Light cardio: 5 minutes

Chest:
- Bench Press: 4 sets of 6-8 reps
- Incline Dumbbell Press: 3 sets of 8-10 reps
- Cable Flyes: 3 sets of 12-15 reps

Triceps:
- Dips: 3 sets to failure
- Overhead Extensions: 3 sets of 10-12 reps

[Closing message - context dependent]

## CRITICAL RULES

* Output **ONE** friendly text message only - no extra text, markdown formatting symbols, or JSON
* Stay under 900 characters in total
* Use the users fitness profile to personalize the message
* Follow the tone and structure guidance provided in the user message`;

/**
 * Builds the dynamic user message for workout message generation
 * Includes context, profile, workout data, and examples
 */
export const buildWorkoutUserMessage = (
  input: WorkoutMessageInput,
  fitnessProfileSubstring: string
): string => {
  const { user, workout, type, context } = input;

  const contextualGuidance = type === 'daily'
    ? buildDailyContext(user)
    : buildModifiedContext(context || {});

  const example = type === 'daily'
    ? buildDailyExample()
    : buildModifiedExample(context || {});

  return `${contextualGuidance}

<Profile>
${fitnessProfileSubstring}
</Profile>

<Workout JSON>
${JSON.stringify(workout)}
</Workout JSON>

${example}

Return ONLY the SMS message.`;
};

/**
 * Build context-specific guidance for daily messages
 */
function buildDailyContext(user: UserWithProfile): string {
  return `
  DAILY MESSAGE CONTEXT:
  * Start with a short greeting that uses "${user.name}"'s first name, or nickname.
  * In <= 1 sentence, connect to a key goal or preference from the profile snippet.
  * Present the workout in a motivational, forward-looking way
  * Close with a brief motivational cue or check-in (<= 1 sentence).
  `;
}

/**
 * Build context-specific guidance for modification messages
 */
function buildModifiedContext(context: Partial<WorkoutMessageContext>): string {
  const modTypeDescription = context.modificationType === 'substitute_exercise'
    ? 'substituted specific exercises'
    : context.modificationType === 'modify_workout'
    ? 'regenerated a single workout'
    : 'updated the weekly pattern and regenerated the workout';

  const modifications = context.modificationsApplied?.join(', ') || 'workout changes';

  return `
  MODIFICATION MESSAGE CONTEXT:
  * User requested: "${context.reason || 'workout modification'}"
  * You ${modTypeDescription}
  * Modifications made: ${modifications}

  TONE REQUIREMENTS:
  * Start with an enthusiastic acknowledgment ("Sure thing!", "Got it!", "On it!")
  * Briefly explain what you did (1 sentence)
  * Present the modified/updated workout clearly
  * Be conversational and friendly, like texting a friend
  * Keep it encouraging and supportive
  `;
}

/**
 * Build example for daily messages
 */
function buildDailyExample(): string {
  return `
<Example>
  Back building day!! Lets build that barn door!

  Back:
  - Deadlifts: 3 sets of 6-8 reps
  - Pull-ups (weighted if needed): 3 sets to failure
  - Barbell Rows: 3 sets of 8-12 reps
  - Seated Cable Rows: 3 sets of 10-15 reps

  Abs:
  - Hanging Leg Raises: 3 sets of 15-20 reps
  - Cable crunches: 3 sets of 15-20 reps
  - Plank: 3 sets, hold for 30-60 seconds

  Remember to focus on form and controlled movements. If you need modifications let me know.
</Example>
`;
}

/**
 * Build example for modification messages
 */
function buildModifiedExample(context: Partial<WorkoutMessageContext>): string {
  if (context.modificationType === 'substitute_exercise') {
    return `
<Example>
  Got it! I swapped out bench press for dumbbell press in today's workout.

  Upper Push:
  - Dumbbell Bench Press: 3 sets of 8-12 reps
  - Overhead Press: 3 sets of 6-8 reps
  - Dips: 3 sets to failure
  - Lateral Raises: 3 sets of 12-15 reps

  You're all set! Let me know how it goes.
</Example>
`;
  }

  if (context.modificationType === 'modify_workout') {
    return `
<Example>
  Sure thing! I modified today's workout for 30 min with home equipment.

  Quick Upper:
  - Push-ups: 3 sets of 15-20 reps
  - Dumbbell Rows: 3 sets of 12-15 reps
  - Pike Push-ups: 3 sets of 10-12 reps
  - Bicep Curls: 3 sets of 12-15 reps

  Short and sweet! You got this.
</Example>
`;
  }

  // modify_week
  return `
<Example>
  On it! I updated your week and regenerated today's workout.

  Back Day (today):
  - Deadlifts: 4 sets of 6-8 reps
  - Pull-ups: 3 sets to failure
  - Barbell Rows: 3 sets of 8-10 reps
  - Face Pulls: 3 sets of 15-20 reps

  I shuffled the rest of your week to keep everything balanced. You're good to go!
</Example>
`;
}
