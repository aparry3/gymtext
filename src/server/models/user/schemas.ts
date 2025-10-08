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
  summary: z.string().optional().nullable(), // Brief overview of schedule and availability
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(15).max(240),
  preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional().nullable(),
  schedule: z.string().optional().nullable(),
});

// NEW - Temporary Environment Change Schema
export const TemporaryEnvironmentChangeSchema = z.object({
  id: z.string(),
  description: z.string(),
  startDate: z.string(), // ISO date string
  endDate: z.string().optional().nullable(), // ISO date string or null for indefinite
  location: z.string().optional().nullable(), // "beach", "hotel", "home", etc.
  equipmentAvailable: z.array(z.string()).optional().nullable(),
  equipmentUnavailable: z.array(z.string()).optional().nullable(),
});

// NEW - Equipment Access Schema
export const EquipmentAccessSchema = z.object({
  summary: z.string().optional().nullable(), // Brief overview of equipment situation
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'community', 'none']).optional().nullable(),
  homeEquipment: z.array(z.string()).optional().nullable(),
  limitations: z.array(z.string()).optional().nullable(),
  temporaryChanges: z.array(TemporaryEnvironmentChangeSchema).optional().nullable(),
});

// DELETED - PreferencesSchema moved to activity-specific data

// Weight schema for metrics (kept but simplified)
export const WeightSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
  date: z.string().optional().nullable(),
});

// DELETED - PRLiftSchema replaced with flexible keyLifts record

// NEW - Simplified User Metrics Schema
export const UserMetricsSchema = z.object({
  summary: z.string().optional().nullable(), // Brief overview of physical stats and fitness level
  height: z.number().positive().optional().nullable(),
  weight: WeightSchema.optional().nullable(),
  bodyComposition: z.number().min(1).max(50).optional().nullable(),
  fitnessLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).optional().nullable(),
});

// NEW - Simplified Constraint Schema
export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'mobility', 'medical', 'preference']),
  description: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional().nullable(),
  affectedMovements: z.array(z.string()).optional().nullable(),
  status: z.enum(['active', 'resolved']),
  startDate: z.string().optional().nullable(), // ISO date string
  endDate: z.string().optional().nullable(), // ISO date string or null for chronic
  isTemporary: z.boolean().default(false),
});


// DELETED - RunningDataSchema consolidated into CardioDataSchema

// NEW - Simplified Strength Data Schema
export const StrengthDataSchema = z.object({
  type: z.literal('strength'),
  summary: z.string().optional().nullable(), // Brief overview of strength training background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  currentProgram: z.string().optional().nullable(),
  keyLifts: z.record(z.string(), z.number()).optional().nullable(),
  preferences: z.object({
    workoutStyle: z.string().optional().nullable(),
    likedExercises: z.array(z.string()).optional().nullable(),
    dislikedExercises: z.array(z.string()).optional().nullable(),
  }).optional().nullable(),
  trainingFrequency: z.number().int().min(1).max(7),
});

// DELETED - CyclingDataSchema consolidated into CardioDataSchema

// NEW - Simplified Cardio Data Schema (replaces running, cycling, general)
export const CardioDataSchema = z.object({
  type: z.literal('cardio'),
  summary: z.string().optional().nullable(), // Brief overview of cardio activities and background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryActivities: z.array(z.string()),
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().optional().nullable(),
    longestSession: z.number().positive().optional().nullable(),
    averagePace: z.string().optional().nullable(),
    preferredIntensity: z.enum(['low', 'moderate', 'high']).optional().nullable(),
  }).optional().nullable(),
  preferences: z.object({
    indoor: z.boolean().optional().nullable(),
    outdoor: z.boolean().optional().nullable(),
    groupVsIndividual: z.enum(['group', 'individual', 'both']).optional().nullable(),
    timeOfDay: z.array(z.string()).optional().nullable(),
  }).optional().nullable(),
  frequency: z.number().int().min(1).max(7).optional().nullable(),
});

// NEW - Simplified Activity Data Schema (only strength + cardio)
export const ActivityDataSchema = z.array(z.union([
  StrengthDataSchema,
  CardioDataSchema,
]));


// NEW - Simplified Goals Schema
export const GoalsSchema = z.object({
  summary: z.string().optional().nullable(), // Brief overview of fitness goals and motivation
  primary: z.string(),
  timeline: z.number().int().min(1).max(104).optional().nullable(), // 1-104 weeks
  specific: z.string().optional().nullable(),
  motivation: z.string().optional().nullable(),
});

// THE ONLY FITNESS PROFILE SCHEMA - COMPLETE REPLACEMENT
export const FitnessProfileSchema = z.object({
  goals: GoalsSchema,

  equipmentAccess: EquipmentAccessSchema.optional().nullable(),
  availability: AvailabilitySchema.optional().nullable(),
  constraints: z.array(ConstraintSchema).optional().nullable(),
  metrics: UserMetricsSchema.optional().nullable(),
  
  activities: ActivityDataSchema.optional().nullable(),
});

// Schema for creating a new user
export const CreateUserSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string()
    .transform(normalizeUSPhoneNumber)
    .refine(validateUSPhoneNumber, { message: 'Must be a valid US phone number' }),
  age: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.string().optional().nullable(),
  profile: z.unknown().optional().nullable(),
  isActive: z.boolean().optional().nullable().default(true),
  isAdmin: z.boolean().optional().nullable().default(false),
  stripeCustomerId: z.string().optional().nullable(),
  preferredSendHour: z.number().int().min(0).max(23).optional().nullable(),
  timezone: z.string().optional().nullable(),
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
  reason: z.string().optional().nullable(),
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
export type TemporaryEnvironmentChange = z.infer<typeof TemporaryEnvironmentChangeSchema>;