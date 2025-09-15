import { z } from 'zod';

/**
 * Schema for user demographics that go in the profile - matches UserSchema from main schemas
 */
export const UserDemographicsSchema = z.object({
  age: z.number().int().min(1).max(120).optional(), // Changed min from 13 to 1 to match main schema
  gender: z.string().optional() // Changed from enum to string to match main schema (which uses z.string().nullable())
});

/**
 * Schema for user contact information
 */
export const UserContactSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  timezone: z.string().optional(),
  preferredSendHour: z.number().int().min(0).max(23).optional()
});

/**
 * Schema for user extraction data
 */
export const UserDataSchema = z.object({
  demographics: UserDemographicsSchema.optional().describe('Demographics for profile (age, gender)'),
  contact: UserContactSchema.optional().describe('Contact information for user record')
});

/**
 * Full user extraction result schema
 */
export const UserExtractionSchema = z.object({
  data: UserDataSchema.nullable().describe('Extracted user data, null if none found'),
  hasData: z.boolean().describe('Whether any relevant user data was extracted'),
  confidence: z.number().min(0).max(1).describe('Confidence score for the extraction'),
  reason: z.string().describe('Brief explanation of what user data was extracted and why')
});

// Export the inferred types
export type UserDemographics = z.infer<typeof UserDemographicsSchema>;
export type UserContact = z.infer<typeof UserContactSchema>;
export type UserData = z.infer<typeof UserDataSchema>;
export type UserExtractionResult = z.infer<typeof UserExtractionSchema>;