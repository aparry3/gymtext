// Model exports for clean imports
export { UserModel } from './userModel';
export { FitnessPlanModel } from './fitnessPlan';
export { MessageModel } from './messageModel';
export { WorkoutInstanceModel } from './workout';
export { MicrocycleModel } from './microcycle';

// Type exports from models
export type {
  User, NewUser, UserUpdate,
  FitnessProfile,
  UserWithProfile, CreateUserData, CreateFitnessProfileData
} from './userModel';

export type {
  Message, NewMessage, MessageUpdate, RecentMessage
} from './conversation';

export type {
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessPlanOverview,
  PlanStructure
} from './fitnessPlan';
export { PlanStructureSchema, PlanScheduleTemplateSchema } from './fitnessPlan';

export type {
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate,
  WorkoutStructure, WorkoutActivity, WorkoutSection, Intensity
} from './workout';
export { WorkoutStructureSchema, WorkoutActivitySchema, WorkoutSectionSchema, IntensitySchema } from './workout';

// Microcycle types
export type { Microcycle, MicrocycleStructure, MicrocycleDay } from './microcycle';
export type { MicrocyclePattern, MicrocycleGenerationOutput } from './microcycle/schema';
export { MicrocycleStructureSchema, MicrocycleDaySchema } from './microcycle';

// Profile types (structured profile from LLM extraction)
export type { StructuredProfile, StructuredConstraint, ExperienceLevel } from './profile';
export { StructuredProfileSchema, StructuredConstraintSchema, ExperienceLevelSchema } from './profile';

// PageVisit types
export type { PageVisit, NewPageVisit } from './pageVisit';

// Re-export database types from _types
export * from './_types';
