import { z } from 'zod';

/**
 * Schema for formatted mesocycle output
 */
export const FormattedMesocycleSchema = z.object({
  formatted: z.string({
    description: 'Markdown-formatted mesocycle overview with weekly progression and coaching notes'
  })
});

export type FormattedMesocycle = z.infer<typeof FormattedMesocycleSchema>;
