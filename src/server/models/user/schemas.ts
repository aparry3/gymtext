import { z } from 'zod';
import type { Users } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { normalizeUSPhoneNumber, validateUSPhoneNumber } from '@/shared/utils/phoneUtils';

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  phoneNumber: z.string()
    .transform(normalizeUSPhoneNumber)
    .refine(validateUSPhoneNumber, { message: 'Must be a valid US phone number' }),
  age: z.number().int().min(1).max(120).nullable(),
  gender: z.string().nullable(),
  profile: z.unknown().nullable(),
  stripeCustomerId: z.string().nullable(),
  preferredSendHour: z.number().int().min(0).max(23),
  timezone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// DELETED - CurrentTrainingSchema replaced with activity-specific data

// NEW - Simplified Availability Schema
export const AvailabilitySchema = z.object({
  summary: z.string().optional(), // Brief overview of schedule and availability
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(15).max(240),
  preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
  schedule: z.string().optional(),
});

// NEW - Equipment Access Schema
export const EquipmentAccessSchema = z.object({
  summary: z.string().optional(), // Brief overview of equipment situation
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'community', 'none']).optional(),
  homeEquipment: z.array(z.string()).optional(),
  limitations: z.array(z.string()).optional(),
});

// DELETED - PreferencesSchema moved to activity-specific data

// Weight schema for metrics (kept but simplified)
export const WeightSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
  date: z.string().optional(),
});

// DELETED - PRLiftSchema replaced with flexible keyLifts record

// NEW - Simplified User Metrics Schema
export const UserMetricsSchema = z.object({
  summary: z.string().optional(), // Brief overview of physical stats and fitness level
  height: z.number().positive().optional(),
  weight: WeightSchema.optional(),
  bodyComposition: z.number().min(1).max(50).optional(),
  fitnessLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional(),
});

// NEW - Simplified Constraint Schema
export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'mobility', 'medical', 'preference']),
  description: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  affectedMovements: z.array(z.string()).optional(),
  status: z.enum(['active', 'resolved']),
});


// DELETED - RunningDataSchema consolidated into CardioDataSchema

// NEW - Simplified Strength Data Schema
export const StrengthDataSchema = z.object({
  type: z.literal('strength'),
  summary: z.string().optional(), // Brief overview of strength training background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  currentProgram: z.string().optional(),
  keyLifts: z.record(z.string(), z.number()).optional(),
  preferences: z.object({
    workoutStyle: z.string().optional(),
    likedExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional(),
  }).optional(),
  trainingFrequency: z.number().int().min(1).max(7),
});

// DELETED - CyclingDataSchema consolidated into CardioDataSchema

// NEW - Simplified Cardio Data Schema (replaces running, cycling, general)
export const CardioDataSchema = z.object({
  type: z.literal('cardio'),
  summary: z.string().optional(), // Brief overview of cardio activities and background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryActivities: z.array(z.string()),
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().optional(),
    longestSession: z.number().positive().optional(),
    averagePace: z.string().optional(),
    preferredIntensity: z.enum(['low', 'moderate', 'high']).optional(),
  }).optional(),
  preferences: z.object({
    indoor: z.boolean().optional(),
    outdoor: z.boolean().optional(),
    groupVsIndividual: z.enum(['group', 'individual', 'both']).optional(),
    timeOfDay: z.array(z.string()).optional(),
  }).optional(),
  frequency: z.number().int().min(1).max(7),
});

// NEW - Simplified Activity Data Schema (only strength + cardio)
export const ActivityDataSchema = z.array(z.union([
  StrengthDataSchema,
  CardioDataSchema,
]));


// NEW - Simplified Goals Schema
export const GoalsSchema = z.object({
  summary: z.string().optional(), // Brief overview of fitness goals and motivation
  primary: z.string(),
  timeline: z.number().int().min(1).max(104).optional(), // 1-104 weeks
  specific: z.string().optional(),
  motivation: z.string().optional(),
});

// THE ONLY FITNESS PROFILE SCHEMA - COMPLETE REPLACEMENT
export const FitnessProfileSchema = z.object({
  goals: GoalsSchema,

  equipmentAccess: EquipmentAccessSchema.optional(),
  availability: AvailabilitySchema.optional(),
  constraints: z.array(ConstraintSchema).optional(),
  metrics: UserMetricsSchema.optional(),
  
  activityData: ActivityDataSchema.optional(),
});

// Schema for creating a new user
export const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  phoneNumber: z.string()
    .transform(normalizeUSPhoneNumber)
    .refine(validateUSPhoneNumber, { message: 'Must be a valid US phone number' }),
  age: z.number().int().min(1).max(120).nullable().optional(),
  gender: z.string().nullable().optional(),
  profile: z.unknown().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isAdmin: z.boolean().optional().default(false),
  stripeCustomerId: z.string().nullable().optional(),
  preferredSendHour: z.number().int().min(0).max(23).optional(),
  timezone: z.string().optional(),
});

// Schema for updating a user
export const UpdateUserSchema = CreateUserSchema.partial();

// Schema for creating/updating fitness profile
export const CreateFitnessProfileSchema = FitnessProfileSchema.partial();

// Profile update patch schema (for tracking changes)
export const ProfileUpdatePatchSchema = z.object({
  field: z.string(),
  oldValue: z.unknown().nullable(),
  newValue: z.unknown().nullable(),
  timestamp: z.date(),
});

// Profile update request schema (for API endpoints)
export const ProfileUpdateRequestSchema = z.object({
  updates: FitnessProfileSchema.partial(),
  source: z.enum(['chat', 'form', 'admin', 'api', 'system']),
  reason: z.string().optional(),
});

// Kysely-based types (using database schema)
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

// Zod-inferred types (for validation)
export type FitnessProfile = z.infer<typeof FitnessProfileSchema>;

// NEW - Activity-specific data types (only strength + cardio)
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type StrengthData = z.infer<typeof StrengthDataSchema>;
export type CardioData = z.infer<typeof CardioDataSchema>;
export type EquipmentAccess = z.infer<typeof EquipmentAccessSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Goals = z.infer<typeof GoalsSchema>;
export type UserMetrics = z.infer<typeof UserMetricsSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;