import { z } from 'zod';

/**
 * Schema for equipment access information
 */
export const EquipmentAccessSchema = z.object({
  summary: z.string().optional().describe('Brief overview of equipment situation'),
  gymAccess: z.boolean().describe('Whether user has gym access'),
  gymType: z.enum(['commercial', 'home', 'community', 'none']).optional().describe('Type of gym access'),
  homeEquipment: z.array(z.string()).optional().describe('Equipment available at home'),
  limitations: z.array(z.string()).optional().describe('Equipment restrictions or limitations')
});

/**
 * Schema for training availability
 */
export const AvailabilitySchema = z.object({
  summary: z.string().optional().describe('Brief overview of schedule and availability'),
  daysPerWeek: z.number().int().min(1).max(7).describe('Training days per week'),
  minutesPerSession: z.number().int().min(15).max(240).describe('Typical session duration in minutes'),
  preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional().describe('Preferred workout times'),
  schedule: z.string().optional().describe('Additional schedule information or constraints')
});

/**
 * Schema for environment extraction data
 */
export const EnvironmentDataSchema = z.object({
  equipmentAccess: EquipmentAccessSchema.optional().describe('Equipment and facility access information'),
  availability: AvailabilitySchema.optional().describe('Training schedule and availability information')
});

/**
 * Full environment extraction result schema
 */
export const EnvironmentExtractionSchema = z.object({
  data: EnvironmentDataSchema.nullable().describe('Extracted environment data, null if none found'),
  hasData: z.boolean().describe('Whether any relevant environment data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what environment data was extracted and why')
});

// Export the inferred types
export type EquipmentAccess = z.infer<typeof EquipmentAccessSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type EnvironmentData = z.infer<typeof EnvironmentDataSchema>;
export type EnvironmentExtractionResult = z.infer<typeof EnvironmentExtractionSchema>;