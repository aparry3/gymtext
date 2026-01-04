import { z } from 'zod';
/**
 * Formatted Workout Schema
 *
 * Replaces complex JSON schemas with a simple formatted text output.
 * See _claude_docs/workouts/WORKOUT_FORMAT_SPEC.md for format specification.
 */
export const FormattedWorkoutSchema = z.object({
    formatted: z.string()
        .min(100)
        .describe(`
      Formatted workout text using extended markdown format.

      REQUIRED STRUCTURE:
      # {Theme} - {Focus}

      ## Session Overview
      **Duration:** ~{X} minutes
      **RPE Target:** {X-Y}
      **Focus:** {focus areas}

      ---

      ## {Emoji} Block 1: {Block Name}
      **Goal:** {Purpose}

      {Work items with exercises, sets, reps, RPE, cues, etc.}

      ---

      ## Coaching Notes
      - {Notes for user}

      FORMAT EXAMPLES:

      Straight sets:
      1. **Barbell Bench Press** [COMPOUND]
         - 4 x 5 reps @ 80% 1RM
         - RPE: 8 | RIR: 2
         - Rest: 3-4 min
         - *Cues: Retract scapula, leg drive*
         - **Progression:** +5lbs from last week

      Supersets:
      **A. Superset (3 rounds, 90s rest between rounds):**
         1a. **Incline DB Press** [SECONDARY]
             - 10-12 reps @ RPE 7
             - *Cue: Full ROM, control eccentric*

         1b. **Cable Face Pulls** [ACCESSORY]
             - 15 reps
             - *Cue: Pull to forehead level*

      Circuits:
      **B. Circuit (2 rounds, 60s rest):**
         2a. **Dips** - 8-10 reps @ RPE 8
         2b. **Lateral Raises** - 12 reps per side
         2c. **Tricep Pushdowns** - 15 reps

      Cardio:
      1. **Easy Run**
         - Duration: 40 min
         - Pace: 9:30-10:00 /mile
         - Heart Rate: Zone 2 (130-145 bpm)
         - *Cues: Relax shoulders, land midfoot*

      IMPORTANT FORMATTING RULES:
      - Use markdown headers (# for title, ## for blocks)
      - Use --- to separate blocks
      - Use **bold** for exercise names
      - Use [TYPE] tags: [PREP], [COMPOUND], [SECONDARY], [ACCESSORY], [CORE], [CARDIO], [COOLDOWN]
      - Use emojis for visual hierarchy
      - Use *italic* for coaching cues
      - Use bullet points (-) for lists
      - Include RPE, sets, reps, rest periods as appropriate
      - Add coaching notes and modifications sections
      - Be comprehensive - include ALL exercises and details
      - Adapt format to workout type (strength, cardio, metcon, etc.)
    `)
}).strict();
/**
 * Enhanced workout with formatted text
 */
export const EnhancedFormattedWorkoutSchema = FormattedWorkoutSchema.extend({
    theme: z.string().describe("Workout theme/title (e.g., 'Upper Push', 'Easy Run')"),
}).strict();
/**
 * Updated workout with modifications tracking
 */
export const UpdatedFormattedWorkoutSchema = EnhancedFormattedWorkoutSchema.extend({
    modificationsApplied: z.array(z.string())
        .describe("List of specific changes made (e.g., 'Replaced Barbell Bench Press with Dumbbell Bench Press due to no barbell available')")
}).strict();
