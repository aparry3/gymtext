import { z } from 'zod';

/**
 * Agent-Specific Plan Schemas
 *
 * These schemas are for agent output formats only.
 * Domain types are in @/server/models/fitnessPlan
 */

// =============================================================================
// Modify Plan Agent Schema
// =============================================================================

/**
 * Zod schema for Modify Plan Agent output
 */
export const ModifyFitnessPlanOutputSchema = z.object({
  description: z.string().describe(
    'The updated structured text plan with PROGRAM ARCHITECTURE, WEEKLY SCHEDULE TEMPLATE, ' +
    'SESSION GUIDELINES, PROGRESSION STRATEGY, DELOAD PROTOCOL, and KEY PRINCIPLES sections'
  ),
  wasModified: z.boolean().describe(
    'Whether the plan was actually modified in response to the change request. ' +
    'False if the current plan already satisfies the request or no changes were needed.'
  ),
  modifications: z.string().default('').describe(
    'Explanation of what changed and why (empty string if wasModified is false). ' +
    'When wasModified is true, describe specific changes made to the plan structure.'
  )
});

export type ModifyFitnessPlanSchemaOutput = z.infer<typeof ModifyFitnessPlanOutputSchema>;
