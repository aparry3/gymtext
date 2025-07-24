import { z } from 'zod';

// Phone number validation schema
export const phoneNumberSearchSchema = z.object({
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, {
    message: 'Invalid phone number format. Please include country code (e.g., +1234567890)'
  })
});

export type PhoneNumberSearch = z.infer<typeof phoneNumberSearchSchema>;
