import { z } from 'zod';

export interface MicrocyclePattern {
  weekIndex: number; // Week within mesocycle
  days: Array<{
    day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
    theme: string; // e.g., "Lower", "Upper Push"
    load?: 'light' | 'moderate' | 'heavy';
    notes?: string;
  }>;
}

export const DayPatternSchema = z.object({
  day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  theme: z.string(),
  load: z.enum(['light', 'moderate', 'heavy']).optional(),
  notes: z.string().optional()
});

export const MicrocyclePatternSchema = z.object({
  weekIndex: z.number(),
  days: z.array(DayPatternSchema)
});