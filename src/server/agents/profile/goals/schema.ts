import { z } from 'zod';

/**
 * Schema for goals extraction data
 */
export const GoalsDataSchema = z.object({
  primary: z.enum([
    'strength', 
    'fat-loss', 
    'muscle-gain', 
    'endurance', 
    'athletic-performance', 
    'general-fitness', 
    'rehabilitation', 
    'competition-prep'
  ]).describe('Primary fitness goal category'),
  specific: z.string().optional().describe('Specific objective or event (e.g., "ski season preparation", "wedding")'),
  timeline: z.number().int().min(1).max(104).optional().describe('Timeline in weeks (1-104)'),
  motivation: z.string().optional().describe('Why they want to achieve this goal'),
  summary: z.string().optional().describe('Brief overview of their fitness goals and motivation')
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