// Model exports for clean imports
export { UserModel } from './userModel';
export { FitnessPlanModel } from './fitnessPlan';
export { ConversationModel } from './conversation';
export { MessageModel } from './messageModel';
export { MesocycleModel } from './mesocycle';
export { MicrocycleModel } from './microcycle';
export { WorkoutModel } from './workout/schema';

// Type exports from models
export type { 
  User, NewUser, UserUpdate, 
  FitnessProfile, NewFitnessProfile, FitnessProfileUpdate,
  UserWithProfile, CreateUserData, CreateFitnessProfileData 
} from './userModel';

export type { 
  Conversation, NewConversation, ConversationUpdate,
  Message, NewMessage, MessageUpdate 
} from './conversation';

export type { 
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessProgram, Macrocycle
} from './fitnessPlan';

export type { 
  Mesocycle, NewMesocycle, MesocycleUpdate 
} from './mesocycle';

export type { 
  Microcycle, NewMicrocycle, MicrocycleUpdate 
} from './microcycle';

export type { 
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate 
} from './workout/schema';

// Re-export database types from _types
export * from './_types';