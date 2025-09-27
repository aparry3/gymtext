import { z } from 'zod';

/**
 * Schema for user extraction data - flattened structure matching Partial<Omit<User, 'profile'>>
 */
export const UserDataSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  age: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.string().optional().nullable(),
  stripeCustomerId: z.string().optional().nullable(),
  preferredSendHour: z.number().int().min(0).max(23).optional().nullable(),
  timezone: z.string().optional().nullable(),
  isActive: z.boolean().optional().nullable(),
  isAdmin: z.boolean().optional().nullable(),
}).describe('Flat user data structure');

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
export type UserData = z.infer<typeof UserDataSchema>;
export type UserExtractionResult = z.infer<typeof UserExtractionSchema>;