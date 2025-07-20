import { User, NewUser, UserUpdate } from './_types';
export type { PhoneNumber } from '@/shared/types/user';

// Re-export Kysely generated types
export type { User, NewUser, UserUpdate };

// Additional user-related types and interfaces
export interface UserWithPlan extends User {
  fitnessPlanId?: string;
  hasActivePlan: boolean;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User validation and business logic can be added here
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const formatPhoneNumber = (phone: string): string => {
  // Ensure phone number starts with +
  return phone.startsWith('+') ? phone : `+${phone}`;
};