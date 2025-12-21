// Model class exports
export { UserModel } from './user';
export { FitnessPlanModel } from './fitnessPlan';
export { WorkoutInstanceModel } from './workout';
export { MicrocycleModel } from './microcycle';

// User types (DB types + shared types re-exported)
export type {
  User, NewUser, UserUpdate,
  FitnessProfile,
  UserWithProfile, CreateUserData, CreateFitnessProfileData
} from './user';

// Message types (DB types)
export type {
  Message, NewMessage, MessageUpdate, RecentMessage
} from './conversation';

// Fitness plan types (DB types + shared types)
export type {
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessPlanOverview,
  PlanStructure
} from './fitnessPlan';
export { PlanStructureSchema, PlanScheduleTemplateSchema } from './fitnessPlan';

// Workout types (DB types + shared types)
export type {
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate,
  WorkoutStructure, WorkoutActivity, WorkoutSection, Intensity
} from './workout';
export { WorkoutStructureSchema, WorkoutActivitySchema, WorkoutSectionSchema, IntensitySchema } from './workout';

// Microcycle types
export type { Microcycle, MicrocycleStructure, MicrocycleDay } from './microcycle';
export type { MicrocyclePattern, MicrocycleGenerationOutput } from './microcycle';
export { MicrocycleStructureSchema, MicrocycleDaySchema } from './microcycle';

// Profile types (structured profile from LLM extraction)
export type { StructuredProfile, StructuredConstraint, ExperienceLevel } from './profile';
export { StructuredProfileSchema, StructuredConstraintSchema, ExperienceLevelSchema } from './profile';

// PageVisit types
export type { PageVisit, NewPageVisit } from './pageVisit';

// Prompt types
export type { Prompt, NewPrompt, PromptRole, PromptPair } from './prompt';

// Re-export database types from _types
export * from './_types';
