// Model exports for clean imports
export { UserModel } from './userModel';
export { FitnessPlanModel } from './fitnessPlan';
export { ConversationModel } from './conversation';
export { MessageModel } from './messageModel';
export { WorkoutInstanceModel } from './workout';

// Type exports from models
export type { 
  User, NewUser, UserUpdate, 
  FitnessProfile,
  UserWithProfile, CreateUserData, CreateFitnessProfileData 
} from './userModel';

export type { 
  Conversation, NewConversation, ConversationUpdate,
  Message, NewMessage, MessageUpdate 
} from './conversation';

export type { 
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessPlanOverview, MesocycleOverview
} from './fitnessPlan';

export type { 
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate,
  WorkoutInstanceBreakdown
} from './workout';

// Microcycle pattern types (not stored in DB)
export type { MicrocyclePattern } from './microcyclePattern';

// Re-export database types from _types
export * from './_types';