import { z } from 'zod';
import type { Users } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';

// Base user schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().nullable(),
  // Prefer phoneNumber; keep phone as backward-compatible alias
  phoneNumber: z.string(),
  phone: z.string().nullable().optional(),
  profile: z.unknown().nullable(),
  stripeCustomerId: z.string().nullable(),
  preferredSendHour: z.number().int().min(0).max(23),
  timezone: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Current training sub-schema
export const CurrentTrainingSchema = z.object({
  programName: z.string().optional(),
  weeksCompleted: z.number().int().min(0).optional(),
  focus: z.string().optional(),
  notes: z.string().optional(),
});

// Availability sub-schema
export const AvailabilitySchema = z.object({
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  minutesPerSession: z.number().int().min(15).max(240).optional(),
  preferredTimes: z.string().optional(),
  travelPattern: z.string().optional(),
  notes: z.string().optional(),
});

// Equipment sub-schema
export const EquipmentSchema = z.object({
  access: z.string().optional(),
  location: z.string().optional(),
  items: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
});

// Preferences sub-schema
export const PreferencesSchema = z.object({
  workoutStyle: z.string().optional(),
  enjoyedExercises: z.array(z.string()).optional(),
  dislikedExercises: z.array(z.string()).optional(),
  coachingTone: z.enum(['friendly', 'tough-love', 'clinical', 'cheerleader']).optional(),
  musicOrVibe: z.string().optional(),
});

// Weight schema for metrics
export const WeightSchema = z.object({
  value: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
});

// PR lift schema
export const PRLiftSchema = z.object({
  weight: z.number().positive(),
  unit: z.enum(['lbs', 'kg']),
  reps: z.number().int().positive().optional(),
  date: z.string().optional(),
});

// Metrics sub-schema
export const MetricsSchema = z.object({
  heightCm: z.number().positive().optional(),
  bodyweight: WeightSchema.optional(),
  bodyFatPercent: z.number().min(1).max(50).optional(),
  prLifts: z.record(z.string(), PRLiftSchema).optional(),
});

// Constraint schema
export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
  label: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  affectedAreas: z.array(z.string()).optional(),
  modifications: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'resolved']),
});

// Activity-specific data schemas
export const HikingDataSchema = z.object({
  type: z.literal('hiking'),
  experienceLevel: z.string().optional(),
  keyMetrics: z.object({
    longestHike: z.number().positive().optional(),
    elevationComfort: z.string().optional(),
    packWeight: z.number().positive().optional(),
    weeklyHikes: z.number().int().positive().optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

export const RunningDataSchema = z.object({
  type: z.literal('running'),
  experienceLevel: z.string().optional(),
  keyMetrics: z.object({
    weeklyMileage: z.number().positive().optional(),
    longestRun: z.number().positive().optional(),
    averagePace: z.string().optional(),
    racesCompleted: z.number().int().nonnegative().optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

export const StrengthDataSchema = z.object({
  type: z.literal('strength'),
  experienceLevel: z.string().optional(),
  keyMetrics: z.object({
    trainingDays: z.number().int().min(1).max(7).optional(),
    benchPress: z.number().positive().optional(),
    squat: z.number().positive().optional(),
    deadlift: z.number().positive().optional(),
    overhead: z.number().positive().optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

export const CyclingDataSchema = z.object({
  type: z.literal('cycling'),
  experienceLevel: z.string().optional(),
  keyMetrics: z.object({
    weeklyHours: z.number().positive().optional(),
    longestRide: z.number().positive().optional(),
    averageSpeed: z.number().positive().optional(),
    terrainTypes: z.array(z.string()).optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

export const SkiingDataSchema = z.object({
  type: z.literal('skiing'),
  experienceLevel: z.string().optional(),
  keyMetrics: z.object({
    daysPerSeason: z.number().int().positive().optional(),
    terrainComfort: z.array(z.string()).optional(),
    yearsSkiing: z.number().int().positive().optional(),
    mountainTypes: z.array(z.string()).optional(),
  }).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

export const GeneralActivityDataSchema = z.object({
  type: z.literal('other'),
  activityName: z.string().optional(),
  experienceLevel: z.string().optional(),
  keyMetrics: z.record(z.string(), z.union([z.number(), z.string()])).optional(),
  equipment: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  experience: z.string().optional(),
  lastUpdated: z.coerce.date().optional(),
});

// Activity data schema - array of typed activity objects
export const ActivityDataSchema = z.union([
  HikingDataSchema,
  RunningDataSchema, 
  StrengthDataSchema,
  CyclingDataSchema,
  SkiingDataSchema,
  GeneralActivityDataSchema
]).array().optional();

// Complete fitness profile schema
export const FitnessProfileSchema = z.object({
  version: z.number().optional(),
  userId: z.string().uuid().optional(),
  
  // Legacy fields for backward compatibility
  fitnessGoals: z.string().optional(),
  skillLevel: z.string().optional(),
  exerciseFrequency: z.string().optional(),
  gender: z.string().optional(),
  age: z.number().int().min(13).max(120).optional(),
  
  // New comprehensive profile fields
  primaryGoal: z.string().optional(),
  specificObjective: z.string().optional(),
  eventDate: z.string().optional(),
  timelineWeeks: z.number().int().min(1).max(52).optional(),
  experienceLevel: z.string().optional(),
  
  currentActivity: z.string().optional(),
  currentTraining: CurrentTrainingSchema.optional(),
  availability: AvailabilitySchema.optional(),
  equipment: EquipmentSchema.optional(),
  preferences: PreferencesSchema.optional(),
  metrics: MetricsSchema.optional(),
  constraints: z.array(ConstraintSchema).optional(),
  
  // Activity-specific data for enhanced intelligence  
  activityData: ActivityDataSchema,
});

// User with profile schema
export const UserWithProfileSchema = UserSchema.extend({
  parsedProfile: FitnessProfileSchema.nullable(),
  info: z.array(z.string()),
});

// Schema for creating a new user
export const CreateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().nullable().optional(),
  // Accept either; normalize to phoneNumber in repositories/services
  phoneNumber: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  profile: z.unknown().nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isAdmin: z.boolean().optional().default(false),
  stripeCustomerId: z.string().nullable().optional(),
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

// Simplified schemas for LLM structured output

// Minimal profile schema for quick updates
export const MinimalProfileUpdateSchema = z.object({
  primaryGoal: z.string().optional(),
  experienceLevel: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  minutesPerSession: z.number().int().min(15).max(240).optional(),
});

// Schema for extracting profile info from conversation
export const ExtractedProfileInfoSchema = z.object({
  updates: z.record(z.string(), z.unknown()),
  confidence: z.enum(['high', 'medium', 'low']),
  needsClarification: z.array(z.string()).optional(),
  suggestedQuestions: z.array(z.string()).optional(),
});

// Schema for workout preferences extraction
export const WorkoutPreferencesExtractionSchema = z.object({
  workoutStyle: z.string().optional(),
  enjoyedExercises: z.array(z.string()).optional(),
  dislikedExercises: z.array(z.string()).optional(),
  constraints: z.array(z.object({
    type: z.string(),
    description: z.string(),
    severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  })).optional(),
});

// Schema for goal analysis
export const GoalAnalysisSchema = z.object({
  primaryGoal: z.string(),
  specificObjective: z.string(),
  recommendedTimelineWeeks: z.number().int(),
  requiredFrequency: z.object({
    daysPerWeek: z.number().int(),
    minutesPerSession: z.number().int(),
  }),
  keyFocusAreas: z.array(z.string()),
  potentialChallenges: z.array(z.string()),
});

// Kysely-based types (using database schema)
export type User = Selectable<Users>;
export type NewUser = Insertable<Users>;
export type UserUpdate = Updateable<Users>;

// Zod-inferred types (for validation)
export type UserValidation = z.infer<typeof UserSchema>;
export type FitnessProfile = z.infer<typeof FitnessProfileSchema>;
export type UserWithProfile = z.infer<typeof UserWithProfileSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
export type CreateFitnessProfile = z.infer<typeof CreateFitnessProfileSchema>;
export type ProfileUpdateRequest = z.infer<typeof ProfileUpdateRequestSchema>;
export type ExtractedProfileInfo = z.infer<typeof ExtractedProfileInfoSchema>;
export type WorkoutPreferencesExtraction = z.infer<typeof WorkoutPreferencesExtractionSchema>;
export type GoalAnalysis = z.infer<typeof GoalAnalysisSchema>;

// Activity-specific data types
export type ActivityData = z.infer<typeof ActivityDataSchema>;
export type ActivityDataArray = ActivityData; // Explicit array type alias
export type HikingData = z.infer<typeof HikingDataSchema>;
export type RunningData = z.infer<typeof RunningDataSchema>;
export type StrengthData = z.infer<typeof StrengthDataSchema>;
export type CyclingData = z.infer<typeof CyclingDataSchema>;
export type SkiingData = z.infer<typeof SkiingDataSchema>;
export type GeneralActivityData = z.infer<typeof GeneralActivityDataSchema>;