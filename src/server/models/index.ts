// Model exports for clean imports
export { UserModel } from './userModel';
export { FitnessPlanModel } from './fitnessPlan';
export { MessageModel } from './messageModel';
export { WorkoutInstanceModel } from './workout';

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
  FitnessPlanDB, FitnessPlanOverview, MesocycleOverview
} from './fitnessPlan';

export type { 
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate
} from './workout';

// Microcycle pattern types (not stored in DB)
export type { MicrocyclePattern } from './microcyclePattern';

// Re-export database types from _types
export * from './_types';