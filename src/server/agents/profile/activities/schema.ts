import { z } from 'zod';

/**
 * Schema for strength activity data - matches StrengthDataSchema from main schemas
 */
export const StrengthActivitySchema = z.object({
  type: z.literal('strength'),
  summary: z.string().optional().describe('Brief overview of strength training background'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']), // Made required to match main, removed 'returning'
  currentProgram: z.string().optional(),
  keyLifts: z.record(z.string(), z.number()).optional(), // Changed from keyMetrics to keyLifts to match main
  preferences: z.object({
    workoutStyle: z.string().optional(),
    likedExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional()
  }).optional(),
  trainingFrequency: z.number().int().min(1).max(7) // Added required field from main schema
});

/**
 * Schema for cardio activity data - matches CardioDataSchema from main schemas
 */
export const CardioActivitySchema = z.object({
  type: z.literal('cardio'),
  summary: z.string().optional().describe('Brief overview of cardio activities and background'),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryActivities: z.array(z.string()),
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().optional(),
    longestSession: z.number().positive().optional(),
    averagePace: z.string().optional(),
    preferredIntensity: z.enum(['low', 'moderate', 'high']).optional() // Added from main schema
  }).optional(),
  preferences: z.object({
    indoor: z.boolean().optional(),
    outdoor: z.boolean().optional(),
    groupVsIndividual: z.enum(['group', 'individual', 'both']).optional(), // Added from main schema
    timeOfDay: z.array(z.string()).optional()
  }).optional(),
  frequency: z.number().int().min(1).max(7) // Added required field from main schema
});

/**
 * Union schema for activity types - matches ActivityDataSchema from main schemas (only strength + cardio)
 */
export const ActivitySchema = z.union([
  StrengthActivitySchema,
  CardioActivitySchema
]);

/**
 * Schema for activities extraction data
 */
export const ActivitiesDataSchema = z.array(ActivitySchema).describe('Array of activity data, even for single activities');

/**
 * Full activities extraction result schema
 */
export const ActivitiesExtractionSchema = z.object({
  data: ActivitiesDataSchema.nullable().describe('Extracted activities data as array, null if none found'),
  hasData: z.boolean().describe('Whether any relevant activities data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what activities were extracted and why')
});

// Export the inferred types
export type StrengthActivity = z.infer<typeof StrengthActivitySchema>;
export type CardioActivity = z.infer<typeof CardioActivitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivitiesData = z.infer<typeof ActivitiesDataSchema>;
export type ActivitiesExtractionResult = z.infer<typeof ActivitiesExtractionSchema>;