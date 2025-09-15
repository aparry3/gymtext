import { z } from 'zod';

/**
 * Schema for weight measurement
 */
export const WeightSchema = z.object({
  value: z.number().positive().describe('Weight value'),
  unit: z.enum(['lbs', 'kg']).describe('Weight unit'),
  date: z.string().optional().describe('Date of measurement (ISO string)')
});

/**
 * Schema for metrics extraction data
 */
export const MetricsDataSchema = z.object({
  summary: z.string().optional().describe('Brief overview of physical stats and fitness level'),
  height: z.number().positive().optional().describe('Height in feet decimal (e.g., 5.75 for 5\'9")'),
  weight: WeightSchema.optional().describe('Current weight with unit'),
  bodyComposition: z.number().min(1).max(50).optional().describe('Body fat percentage (1-50)'),
  fitnessLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional().describe('Self-assessed fitness level')
});

/**
 * Full metrics extraction result schema
 */
export const MetricsExtractionSchema = z.object({
  data: MetricsDataSchema.nullable().describe('Extracted metrics data, null if none found'),
  hasData: z.boolean().describe('Whether any relevant metrics data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what metrics were extracted and why')
});

// Export the inferred types
export type Weight = z.infer<typeof WeightSchema>;
export type MetricsData = z.infer<typeof MetricsDataSchema>;
export type MetricsExtractionResult = z.infer<typeof MetricsExtractionSchema>;