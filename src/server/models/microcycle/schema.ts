import { z } from "zod";

export const _StructuredDaySchema = z.object({
  day: z.enum(
    [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ],
    {
      description: "Day of the week",
    }
  ),
  theme: z.string({
    description: "Training theme or name of the session (e.g., 'Upper Strength', 'Lower Hypertrophy', 'Conditioning / Recovery')",
  }),
  load: z
    .enum(["light", "moderate", "heavy"])
    .nullish()
    .describe("Relative training load intensity for the day."),
  primaryMuscleGroups: z
    .array(z.string())
    .nullish()
    .describe("Primary muscle groups targeted in this session."),
  secondaryMuscleGroups: z
    .array(z.string())
    .nullish()
    .describe("Secondary muscle groups worked."),
  sessionFocus: z
    .string()
    .nullish()
    .describe("High-level goal or adaptation focus for this day (e.g., hypertrophy, power, endurance)."),
  intensity: z
    .object({
      percent1RM: z.string().nullish(),
      rir: z.string().nullish(),
    })
    .nullish()
    .describe("Load/intensity prescription cues for compound lifts."),
  volumeTarget: z
    .object({
      setsPerMuscle: z.string().nullish(),
      totalSetsEstimate: z.number().nullish(),
    })
    .nullish()
    .describe("Target training volume for the day."),
  conditioning: z
    .string()
    .nullish()
    .describe("Conditioning or cardio details (e.g., 'Zone 2 – 25–30 min @ RPE 5–6')."),
  sessionDuration: z
    .string()
    .nullish()
    .describe("Approximate training duration, e.g. '60 min'."),
  notes: z
    .string()
    .nullish()
    .describe("Coaching notes, recovery reminders, or specific cues."),
});

export const _StructuredMicrocycleSchema = z.object({
  weekIndex: z.number({
    description: "The week number within the mesocycle (1-based).",
  }),
  weekFocus: z
    .string()
    .nullish()
    .describe("The theme or focus of the week (e.g., Volume Progression, Deload)."),
  objectives: z
    .string()
    .nullish()
    .describe("Overall goals or adaptations being targeted this week."),
  averageSessionDuration: z
    .string()
    .nullish()
    .describe("Average planned duration for each session."),
  isDeload: z
    .boolean()
    .default(false)
    .describe("Whether this week is a deload or transition week."),
  days: z.array(_StructuredDaySchema, {
    description: "Detailed structure of each training day within this week.",
  }),
  weeklyNotes: z
    .string()
    .nullish()
    .describe("Summary notes for coaches or athletes reviewing this week."),
});



export type MicrocyclePattern = z.infer<typeof _StructuredMicrocycleSchema>;

export const _UpdatedMicrocyclePatternSchema = _StructuredMicrocycleSchema.extend({
  modificationsApplied: z.array(z.string()).describe('List of specific changes made to the weekly pattern (e.g., "Changed Monday from Upper Push to Home Upper - no gym access")')
});

export type UpdatedMicrocyclePattern = z.infer<typeof _UpdatedMicrocyclePatternSchema>;

/**
 * Schema for formatted microcycle output
 * Contains markdown-formatted weekly overview for frontend display
 */
export const FormattedMicrocycleSchema = z.object({
  formatted: z.string({
    description: 'Markdown-formatted weekly training overview with all 7 days structured for display'
  })
});

export type FormattedMicrocycle = z.infer<typeof FormattedMicrocycleSchema>;
