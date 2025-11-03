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
    .optional()
    .describe("Relative training load intensity for the day."),
  primaryMuscleGroups: z
    .array(z.string())
    .optional()
    .describe("Primary muscle groups targeted in this session."),
  secondaryMuscleGroups: z
    .array(z.string())
    .optional()
    .describe("Secondary muscle groups worked."),
  sessionFocus: z
    .string()
    .optional()
    .describe("High-level goal or adaptation focus for this day (e.g., hypertrophy, power, endurance)."),
  intensity: z
    .object({
      percent1RM: z.string().optional(),
      rir: z.string().optional(),
    })
    .optional()
    .describe("Load/intensity prescription cues for compound lifts."),
  volumeTarget: z
    .object({
      setsPerMuscle: z.string().optional(),
      totalSetsEstimate: z.number().optional(),
    })
    .optional()
    .describe("Target training volume for the day."),
  conditioning: z
    .string()
    .nullable()
    .optional()
    .describe("Conditioning or cardio details (e.g., 'Zone 2 – 25–30 min @ RPE 5–6')."),
  sessionDuration: z
    .string()
    .optional()
    .describe("Approximate training duration, e.g. '60 min'."),
  notes: z
    .string()
    .optional()
    .describe("Coaching notes, recovery reminders, or specific cues."),
});

export const _StructuredMicrocycleSchema = z.object({
  weekIndex: z.number({
    description: "The week number within the mesocycle (1-based).",
  }),
  weekFocus: z
    .string()
    .optional()
    .describe("The theme or focus of the week (e.g., Volume Progression, Deload)."),
  objectives: z
    .string()
    .optional()
    .describe("Overall goals or adaptations being targeted this week."),
  averageSessionDuration: z
    .string()
    .optional()
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
    .optional()
    .describe("Summary notes for coaches or athletes reviewing this week."),
});
