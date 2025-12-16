import { z } from "zod";

/**
 * Schema for microcycle generation output
 *
 * Simplified structure:
 * - overview: Description of the week's focus and goals
 * - isDeload: Whether this is a deload week
 * - days: Array of 7 day descriptions (strings)
 */
export const _MicrocycleGenerationSchema = z.object({
  overview: z.string({
    description: "Overview of the week's training focus, objectives, and progression context"
  }),
  isDeload: z.boolean({
    description: "Whether this is a deload week (reduced volume/intensity)"
  }).default(false),
  days: z.array(z.string(), {
    description: "Array of 7 day descriptions (day 1 through day 7). Each string describes the session for that day including theme, focus, volume/intensity targets, and conditioning if applicable."
  }).length(7, "Must have exactly 7 days")
});

export type MicrocycleGenerationOutput = z.infer<typeof _MicrocycleGenerationSchema>;

/**
 * Full microcycle pattern
 */
export interface MicrocyclePattern {
  overview: string;
  isDeload: boolean;
  days: string[];
  message?: string;
}

/**
 * Updated microcycle pattern with modification tracking
 */
export interface UpdatedMicrocyclePattern extends MicrocyclePattern {
  modificationsApplied?: string[];
}
