import { z } from 'zod';

export const _DayPatternSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  theme: z.string().describe('Training theme for the day (e.g., "Lower", "Upper Push", "Rest")'),
  load: z.enum(['light', 'moderate', 'heavy']).optional(),
  notes: z.string().optional(),
});

export const _MicrocyclePatternSchema = z.object({
  weekIndex: z.number().describe('Week number within the mesocycle'),
  days: z.array(_DayPatternSchema).length(7).describe('Training pattern for each day of the week'),
});

export const _MicrocycleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  fitnessPlanId: z.string().uuid(),
  mesocycleIndex: z.number().int().nonnegative(),
  weekNumber: z.number().int().positive(),
  pattern: _MicrocyclePatternSchema,
  startDate: z.date(),
  endDate: z.date(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DayPattern = z.infer<typeof _DayPatternSchema>;
export type MicrocyclePattern = z.infer<typeof _MicrocyclePatternSchema>;
export type MicrocycleSchema = z.infer<typeof _MicrocycleSchema>;