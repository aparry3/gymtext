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
  FitnessPlanDB, FitnessPlanOverview
} from './fitnessPlan';

export type {
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate
} from './workout';

// Microcycle types
export type { Microcycle } from './microcycle';
export type { MicrocyclePattern, MicrocycleGenerationOutput } from './microcycle/schema';

// Re-export database types from _types
export * from './_types';
