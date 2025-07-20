import { z } from 'zod';

// Phone number validation schema
export const phoneNumberSearchSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format. Please include country code (e.g., +1234567890)'
  })
});

// Plan ID validation schema
export const planIdSchema = z.object({
  planId: z.string().uuid({
    message: 'Invalid plan ID format'
  })
});

// Admin search query schema
export const adminSearchQuerySchema = z.object({
  phoneNumber: z.string().optional(),
  planId: z.string().uuid().optional()
}).refine(
  (data) => data.phoneNumber || data.planId,
  {
    message: 'Either phoneNumber or planId must be provided'
  }
);

// Type exports
export type PhoneNumberSearch = z.infer<typeof phoneNumberSearchSchema>;
export type PlanIdSearch = z.infer<typeof planIdSchema>;
export type AdminSearchQuery = z.infer<typeof adminSearchQuerySchema>;