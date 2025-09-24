import { z } from 'zod';

/**
 * Schema for goals extraction data - matches GoalsSchema from main schemas
 */
export const GoalsDataSchema = z.object({
  summary: z.string().optional().nullable().describe('Brief overview of fitness goals and motivation'),
  primary: z.string().describe('Primary fitness goal category'), // Changed from enum to string to match main schema
  timeline: z.number().int().min(1).max(104).describe('Timeline in weeks (1-104)'), // Made required to match main
  specific: z.string().optional().nullable().describe('Specific objective or event (e.g., "ski season preparation", "wedding")'),
  motivation: z.string().optional().nullable().describe('Why they want to achieve this goal')
});

/**
 * Full goals extraction result schema
 */
export const GoalsExtractionSchema = z.object({
  data: GoalsDataSchema.nullable().describe('Extracted goals data, null if none found'),
  hasData: z.boolean().describe('Whether any relevant goals data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what was extracted and why')
});

// Export the inferred types
export type GoalsData = z.infer<typeof GoalsDataSchema>;
export type GoalsExtractionResult = z.infer<typeof GoalsExtractionSchema>;