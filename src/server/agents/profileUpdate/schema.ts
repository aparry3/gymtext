import { z } from 'zod';

/**
 * Zod schema for Profile Update Agent output
 */
export const ProfileUpdateOutputSchema = z.object({
  updatedProfile: z.string().describe('The complete updated Markdown profile document'),
  wasUpdated: z.boolean().describe('Whether any changes were made to the profile'),
  updateSummary: z.string().optional().describe('Brief summary of changes made'),
});

export type ProfileUpdateSchemaOutput = z.infer<typeof ProfileUpdateOutputSchema>;
