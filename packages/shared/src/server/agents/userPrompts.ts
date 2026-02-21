/**
 * User Prompt Templates for Agents
 *
 * Simple, clean templates that take one input value.
 * These are used by the update script to populate agent_definitions.
 */

// Profile Agent - Creates/updates fitness profiles
export const PROFILE_UPDATE_USER_PROMPT = `Create or update a fitness profile based on:

{{input}}

Use the standard profile format with IDENTITY, GOALS, TRAINING CONTEXT, METRICS, and LOG sections.
Validate all fields and ensure data consistency.`;

// Plan Agent - Generates training programs
export const PLAN_GENERATE_USER_PROMPT = `Design a training program based on:

{{input}}

Use the standard program format with Program Philosophy, Phase structure, Progression Strategy, and Phase Cycling.
Consider the user's goals, constraints, and schedule.`;

// Week/Microcycle Agent - Generates weekly workouts
export const WEEK_GENERATE_USER_PROMPT = `Generate a microcycle (weekly workout plan) based on:

{{input}}

Use the standard microcycle format with Schedule, Week Overview, daily Workouts, and Weekly Summary.
Include warm-up, main workout, and cool down for each session.`;

// Workout Message Agent - Formats daily workout messages
export const WORKOUT_FORMAT_USER_PROMPT = `Convert this workout into a daily text message:

{{input}}

Use the standard message format: Session title, warm-up (brief), workout (sets×reps@weight), notes (1-2 sentences).
Keep it concise and coach-like.`;

// Week Modify Agent - Modifies existing microcycles
export const WEEK_MODIFY_USER_PROMPT = `Modify the existing microcycle based on:

{{input}}

Use the standard microcycle format. Show changes with strikethrough for original → new.
Append a LOG section documenting this modification (date, context, changes, rationale).`;
