import { z } from 'zod';

/**
 * Schema for individual constraint
 */
export const ConstraintSchema = z.object({
  id: z.string().describe('Unique identifier for the constraint'),
  type: z.enum(['injury', 'mobility', 'medical', 'preference']).describe('Type of constraint'),
  description: z.string().describe('Clear description of the constraint'),
  severity: z.enum(['mild', 'moderate', 'severe']).nullable().optional().describe('Severity level (not applicable for preferences)'),
  affectedMovements: z.array(z.string()).nullable().optional().describe('List of movements that should be modified/avoided'),
  status: z.enum(['active', 'resolved']).describe('Current status of the constraint')
});

/**
 * Schema for constraints extraction data
 */
export const ConstraintsDataSchema = z.array(ConstraintSchema).describe('Array of constraints, even for single constraint');

/**
 * Full constraints extraction result schema
 */
export const ConstraintsExtractionSchema = z.object({
  data: ConstraintsDataSchema.nullable().describe('Extracted constraints data as array, null if none found'),
  hasData: z.boolean().describe('Whether any relevant constraints data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what constraints were extracted and why')
});

// Export the inferred types
export type Constraint = z.infer<typeof ConstraintSchema>;
export type ConstraintsData = z.infer<typeof ConstraintsDataSchema>;
export type ConstraintsExtractionResult = z.infer<typeof ConstraintsExtractionSchema>;