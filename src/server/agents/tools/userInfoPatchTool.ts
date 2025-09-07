import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import type { User } from '@/server/models/userModel';
import { normalizeUSPhoneNumber, validateUSPhoneNumber } from '@/shared/utils/phoneUtils';

export const userInfoPatchTool = tool(
  async ({ currentUser, updates, reason, confidence }) => {
    const CONFIDENCE_THRESHOLD = 0.75;

    if (confidence < CONFIDENCE_THRESHOLD) {
      return {
        applied: false,
        reason: 'Low confidence',
        confidence,
        threshold: CONFIDENCE_THRESHOLD,
        updatedUser: currentUser
      } as const;
    }

    // Normalize inputs
    let { name, email } = updates;
    const { phoneNumber } = updates;

    // Normalize phone number using centralized utility
    const normalizedPhone = normalizeUSPhoneNumber(phoneNumber);

    const fieldsUpdated: string[] = [];
    const userUpdate: Partial<User> = { ...currentUser };

    if (typeof name === 'string') {
      name = name.trim();
      if (name.length > 0) {
        userUpdate.name = name;
        fieldsUpdated.push('name');
      }
    }
    if (typeof email === 'string') {
      email = email.trim();
      // Basic email validation via zod
      const EmailSchema = z.string().email();
      if (EmailSchema.safeParse(email).success) {
        userUpdate.email = email;
        fieldsUpdated.push('email');
      }
    }
    if (typeof phoneNumber === 'string' && normalizedPhone) {
      // Validate using centralized US phone validation
      if (validateUSPhoneNumber(normalizedPhone)) {
        userUpdate.phoneNumber = normalizedPhone;
        fieldsUpdated.push('phoneNumber');
      }
    }

    // Nothing valid to update
    if (fieldsUpdated.length === 0) {
      return {
        applied: false,
        reason: 'No valid fields to update',
        confidence,
        updatedUser: currentUser,
        fieldsUpdated: []
      } as const;
    }

    console.log(`User info update applied:`, {
      confidence,
      reason,
      fieldsUpdated
    });

    return {
      applied: true,
      updatedUser: userUpdate,
      fieldsUpdated,
      confidence,
      reason,
    } as const;
  },
  {
    name: 'update_user_info',
    description: 'Update user contact info (name, email, phoneNumber) based on conversation. Works with partial user objects.',
    schema: z.object({
      currentUser: z
        .object({
          name: z.string().optional(),
          email: z.string().optional(),
          phoneNumber: z.string().optional(),
        })
        .passthrough()
        .describe('Current user information state'),
      updates: z
        .object({
          name: z.string().min(1).optional(),
          email: z.string().optional(),
          phoneNumber: z.string().optional(),
        })
        .refine((obj) => Object.keys(obj).length > 0, {
          message: 'At least one field must be provided in updates',
        }),
      reason: z
        .string()
        .min(1)
        .describe('Why these updates should be applied (from conversation context).'),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .describe('0-1 confidence score; ≥0.75 required for updates.'),
    }),
  }
);
