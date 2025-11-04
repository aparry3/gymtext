import { z } from 'zod';

/**
 * Schema for user extraction data - flattened structure matching Partial<Omit<User, 'profile'>>
 */
export const UserDataSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phoneNumber: z.string().nullish(),
  age: z.number().int().min(1).max(120).nullish(),
  gender: z.string().nullish(),
  stripeCustomerId: z.string().nullish(),
  preferredSendHour: z.number().int().min(0).max(23).nullish(),
  timezone: z.string().nullish(),
  isActive: z.boolean().nullish(),
  isAdmin: z.boolean().nullish(),
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