import { z } from 'zod';
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
  stripeCustomerId: z.string().nullable(),
  preferredSendHour: z.number().int().min(0).max(23),
  timezone: z.string(),
  
  // WhatsApp and messaging preferences
  preferredMessagingProvider: z.string().nullable()
    .refine((val) => val === null || ['twilio', 'whatsapp'].includes(val), {
      message: 'Must be "twilio" or "whatsapp"'
    })
    .transform((val) => val as 'twilio' | 'whatsapp' | null),
  whatsappOptIn: z.boolean().nullable(),
  whatsappOptInDate: z.date().nullable(),
  whatsappNumber: z.string().nullable(),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

// NEW - Simplified Availability Schema
export const AvailabilitySchema = z.object({
  summary: z.string().nullish(), // Brief overview of schedule and availability
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerSession: z.number().int().min(15).max(240),
  preferredTimes: z.array(z.enum(['morning', 'afternoon', 'evening'])).nullish(),
  schedule: z.string().nullish(),
});

// NEW - Temporary Environment Change Schema
export const TemporaryEnvironmentChangeSchema = z.object({
  id: z.string(),
  description: z.string(),
  startDate: z.string(), // ISO date string
  endDate: z.string().nullish(), // ISO date string or null for indefinite
  location: z.string().nullish(), // "beach", "hotel", "home", etc.
  equipmentAvailable: z.array(z.string()).nullish(),
  equipmentUnavailable: z.array(z.string()).nullish(),
});

// NEW - Equipment Access Schema
export const EquipmentAccessSchema = z.object({
  summary: z.string().nullish(), // Brief overview of equipment situation
  gymAccess: z.boolean(),
  gymType: z.enum(['commercial', 'home', 'community', 'none']).nullish(),
  homeEquipment: z.array(z.string()).nullish(),
  limitations: z.array(z.string()).nullish(),
  temporaryChanges: z.array(TemporaryEnvironmentChangeSchema).nullish(),
});

// Weight schema for metrics (kept but simplified)
export const WeightSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
  date: z.string().nullish(),
});

// NEW - Simplified User Metrics Schema
export const UserMetricsSchema = z.object({
  summary: z.string().nullish(), // Brief overview of physical stats and fitness level
  height: z.number().positive().nullish(),
  weight: WeightSchema.nullish(),
  bodyComposition: z.number().min(1).max(50).nullish(),
  fitnessLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active']).nullish(),
});

// NEW - Simplified Constraint Schema
export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'mobility', 'medical', 'preference']),
  description: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).nullish(),
  affectedMovements: z.array(z.string()).nullish(),
  status: z.enum(['active', 'resolved']),
  startDate: z.string().nullish(), // ISO date string
  endDate: z.string().nullish(), // ISO date string or null for chronic
  isTemporary: z.boolean().default(false),
});

// NEW - Simplified Strength Data Schema
export const StrengthDataSchema = z.object({
  type: z.literal('strength'),
  summary: z.string().nullish(), // Brief overview of strength training background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  currentProgram: z.string().nullish(),
  keyLifts: z.record(z.string(), z.number()).nullish(),
  preferences: z.object({
    workoutStyle: z.string().nullish(),
    likedExercises: z.array(z.string()).nullish(),
    dislikedExercises: z.array(z.string()).nullish(),
  }).nullish(),
  trainingFrequency: z.number().int().min(1).max(7),
});

// NEW - Simplified Cardio Data Schema (replaces running, cycling, general)
export const CardioDataSchema = z.object({
  type: z.literal('cardio'),
  summary: z.string().nullish(), // Brief overview of cardio activities and background
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  primaryActivities: z.array(z.string()),
  keyMetrics: z.object({
    weeklyDistance: z.number().positive().nullish(),
    longestSession: z.number().positive().nullish(),
    averagePace: z.string().nullish(),
    preferredIntensity: z.enum(['low', 'moderate', 'high']).nullish(),
  }).nullish(),
  preferences: z.object({
    indoor: z.boolean().nullish(),
    outdoor: z.boolean().nullish(),
    groupVsIndividual: z.enum(['group', 'individual', 'both']).nullish(),
    timeOfDay: z.array(z.string()).nullish(),
  }).nullish(),
  frequency: z.number().int().min(1).max(7).nullish(),
});

// NEW - Simplified Activity Data Schema (only strength + cardio)
export const ActivityDataSchema = z.array(z.union([
  StrengthDataSchema,
  CardioDataSchema,
]));

// NEW - Simplified Goals Schema
export const GoalsSchema = z.object({
  summary: z.string().nullish(), // Brief overview of fitness goals and motivation
  primary: z.string(),
  timeline: z.number().int().min(1).max(104).nullish(), // 1-104 weeks
  specific: z.string().nullish(),
  motivation: z.string().nullish(),
});

// THE ONLY FITNESS PROFILE SCHEMA - COMPLETE REPLACEMENT
export const FitnessProfileSchema = z.object({
  goals: GoalsSchema,

  // Overall experience level - single source of truth for fitness experience
  // Can be derived from primary activity or set explicitly
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']).nullish(),

  equipmentAccess: EquipmentAccessSchema.nullish(),
  availability: AvailabilitySchema.nullish(),
  constraints: z.array(ConstraintSchema).nullish(),
  metrics: UserMetricsSchema.nullish(),

  activities: ActivityDataSchema.nullish(),
});

// Units preference type
export const UnitsSchema = z.enum(['imperial', 'metric']);
export type Units = z.infer<typeof UnitsSchema>;

// Schema for creating a new user
export const CreateUserSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phoneNumber: z.string()
    .transform(normalizeUSPhoneNumber)
    .refine(validateUSPhoneNumber, { message: 'Must be a valid US phone number' }),
  age: z.number().int().min(1).max(120).nullish(),
  gender: z.string().nullish(),
  isActive: z.boolean().nullish().default(true),
  isAdmin: z.boolean().nullish().default(false),
  stripeCustomerId: z.string().nullish(),
  preferredSendHour: z.number().int().min(0).max(23).nullish(),
  timezone: z.string().nullish(),
  units: UnitsSchema.default('imperial'),
  
  // Messaging preferences (SMS via Twilio or WhatsApp - one or the other)
  preferredMessagingProvider: z.string().nullish()
    .refine((val) => val == null || ['twilio', 'whatsapp'].includes(val), {
      message: 'Must be "twilio" or "whatsapp"'
    })
    .transform((val) => val as 'twilio' | 'whatsapp' | null | undefined),
  messagingOptIn: z.boolean().nullish(),
  messagingOptInDate: z.date().nullish(),
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

// Zod-inferred types (for validation)
export type FitnessProfile = z.infer<typeof FitnessProfileSchema>;

// Activity-specific data types (only strength + cardio)
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type StrengthData = z.infer<typeof StrengthDataSchema>;
export type CardioData = z.infer<typeof CardioDataSchema>;
export type EquipmentAccess = z.infer<typeof EquipmentAccessSchema>;
export type Availability = z.infer<typeof AvailabilitySchema>;
export type Goals = z.infer<typeof GoalsSchema>;
export type UserMetrics = z.infer<typeof UserMetricsSchema>;
export type Constraint = z.infer<typeof ConstraintSchema>;
export type TemporaryEnvironmentChange = z.infer<typeof TemporaryEnvironmentChangeSchema>;
