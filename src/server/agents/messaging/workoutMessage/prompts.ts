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
- Start with a brief intro/greeting (1 line)
- Use separate sections: "Warmup:", "Workout:", "Cooldown:" (if applicable)
- List exercises under each header with a dash (-)
- Use SxR format: "3x10" means 3 sets of 10 reps, "3x6-8" means 3 sets of 6-8 reps
- Abbreviate common terms: Barbell → BB, Dumbbell → DB, Romanian → Romanian (keep), Bulgarian → Bulgarian (keep)
- Keep exercise lines under ~35 characters when possible for mobile readability
- List each exercise separately (no grouping with commas)
- Remove all parenthetical details, alternatives, and extra descriptions from exercise lines
- End with a brief motivational message (1 line)

**Example Structure:**

[Intro message - context dependent]

Warmup:
- Hip Circles: 3x12
- Ankle Mobility: 3x12
- Leg Swings: 3x12
- Goblet Squat (light): 2x12

Workout:
- BB Back Squat: 4x5
- DB RDL: 3x6-8
- Walking Lunge: 3x10 per leg
- Leg Extensions: 3x15
- Lying Leg Curls: 3x15
- Standing Calf Raises: 4x15

Cooldown:
- Hamstring Stretch: 2 min
- Quad Stretch: 2 min

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

  Warmup:
  - Band Pull-Aparts: 3x15
  - Scapular Wall Slides: 3x12
  - Cat-Cow Stretch: 2x10

  Workout:
  - BB Deadlifts: 3x6-8
  - Pull-ups: 3x to failure
  - BB Rows: 3x8-12
  - Seated Cable Rows: 3x10-15
  - Hanging Leg Raises: 3x15-20
  - Cable Crunches: 3x15-20
  - Plank: 3x30-60 sec

  Cooldown:
  - Lat Stretch: 2 min
  - Lower Back Stretch: 2 min

  Focus on form and controlled movements. Let me know if you need any modifications!
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
`;
  }

  if (context.modificationType === 'modify_workout') {
    return `
<Example>
  Sure thing! Modified today's workout for 30 min with home equipment.

  Warmup:
  - Arm Circles: 2x20 sec

  Workout:
  - Push-ups: 3x15-20
  - DB Rows: 3x12-15
  - Pike Push-ups: 3x10-12
  - DB Bicep Curls: 3x12-15

  Cooldown:
  - Shoulder Stretch: 1 min

  Short and sweet! You got this.
</Example>
`;
  }

  // modify_week
  return `
<Example>
  On it! Updated your week and regenerated today's workout.

  Warmup:
  - Band Pull-Aparts: 3x15
  - Cat-Cow Stretch: 2x10

  Workout:
  - BB Deadlifts: 4x6-8
  - Pull-ups: 3x to failure
  - BB Rows: 3x8-10
  - Face Pulls: 3x15-20

  Cooldown:
  - Lat Stretch: 2 min

  Shuffled the rest of your week to keep everything balanced. You're good to go!
</Example>
`;
}
