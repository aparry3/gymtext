import { z } from 'zod';

export const _DayPatternSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], {
    description: "Day of the week"
  }),
  theme: z.string({
    description: "Training theme for the day, e.g., 'Lower Power', 'Upper Push', 'Rest'"
  }),
  load: z.enum(['light', 'moderate', 'heavy'], {
    description: "Training load intensity for the day"
  }).optional(),
  notes: z.string({
    description: "Additional notes or instructions for the day"
  }).optional()
});

export const _MicrocyclePatternSchema = z.object({
  weekIndex: z.number({
    description: "The week number within the mesocycle (1-based)"
  }),
  days: z.array(_DayPatternSchema, {
    description: "Pattern of training days for this week"
  })
});