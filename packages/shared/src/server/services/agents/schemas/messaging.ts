import { z } from 'zod';

/**
 * Agent-Specific Messaging Schemas
 *
 * These schemas are for agent output formats only.
 */

// =============================================================================
// Plan Summary Schema
// =============================================================================

/**
 * Zod schema for Plan Summary Agent output
 */
export const PlanSummarySchema = z.object({
  messages: z.array(z.string()).describe('Array of SMS messages (each under 160 chars)')
});

export type PlanSummaryOutput = z.infer<typeof PlanSummarySchema>;
