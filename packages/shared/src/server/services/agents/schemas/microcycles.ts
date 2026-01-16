import { z } from 'zod';

/**
 * Agent-Specific Microcycle Schemas
 *
 * These schemas are for agent output formats only.
 * Domain types are in @/server/models/microcycle
 */

// =============================================================================
// Generate Microcycle Agent Schema
// =============================================================================

/**
 * Zod schema for Generate Microcycle Agent output
 */
export const MicrocycleGenerationOutputSchema = z.object({
  overview: z.string({
    description: 'Comprehensive weekly overview including week number, theme, objective, split, volume/intensity trends, conditioning plan, and rest day placement'
  }),
  isDeload: z.boolean().default(false).describe('Whether this is a deload/recovery week with reduced volume and intensity'),
  days: z.array(z.string(), {
    description: 'Exactly 7 day overview strings in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'
  }).length(7)
});

export type MicrocycleGenerationOutput = z.infer<typeof MicrocycleGenerationOutputSchema>;

// =============================================================================
// Modify Microcycle Agent Schema
// =============================================================================

/**
 * Zod schema for Modify Microcycle Agent output
 */
export const ModifyMicrocycleOutputSchema = MicrocycleGenerationOutputSchema.extend({
  wasModified: z.boolean().describe(
    'Whether the microcycle was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  ),
  modifications: z.string().default('').describe(
    'Explanation of what changed and why (empty string if wasModified is false). ' +
    'When wasModified is true, describe specific changes made to the weekly pattern.'
  )
});

export type ModifyMicrocycleOutput = z.infer<typeof ModifyMicrocycleOutputSchema>;
