import { z } from 'zod';

/**
 * Schema for strength activity data
 */
export const StrengthActivitySchema = z.object({
  type: z.literal('strength'),
  experience: z.enum(['beginner', 'intermediate', 'advanced', 'returning']).optional(),
  currentProgram: z.string().optional(),
  keyMetrics: z.object({
    trainingDays: z.number().int().min(1).max(7).optional(),
    benchPress: z.number().positive().optional(),
    squat: z.number().positive().optional(),
    deadlift: z.number().positive().optional()
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  preferences: z.object({
    workoutStyle: z.string().optional(),
    likedExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema for cardio activity data
 */
export const CardioActivitySchema = z.object({
  type: z.literal('cardio'),
  primaryActivities: z.array(z.string()),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().optional(),
    longestSession: z.number().positive().optional(),
    averagePace: z.string().optional(),
    unit: z.enum(['miles', 'km']).optional()
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  preferences: z.object({
    indoor: z.boolean().optional(),
    outdoor: z.boolean().optional(),
    timeOfDay: z.array(z.string()).optional()
  }).optional()
});

/**
 * Schema for other activity types
 */
export const OtherActivitySchema = z.object({
  type: z.literal('other'),
  activityName: z.string(),
  experience: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  keyMetrics: z.record(z.unknown()).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional()
});

/**
 * Union schema for all activity types
 */
export const ActivitySchema = z.union([
  StrengthActivitySchema,
  CardioActivitySchema,
  OtherActivitySchema
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
export type OtherActivity = z.infer<typeof OtherActivitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type ActivitiesData = z.infer<typeof ActivitiesDataSchema>;
export type ActivitiesExtractionResult = z.infer<typeof ActivitiesExtractionSchema>;