// Model exports for clean imports
export { UserModel } from './userModel';
export { FitnessPlanModel } from './fitnessPlanModel';
export { ConversationModel } from './conversationModel';
export { MessageModel } from './messageModel';
export { MesocycleModel } from './mesocycleModel';
export { MicrocycleModel } from './microcycleModel';
export { WorkoutModel } from './workoutModel';

// Type exports from models
export type { 
  User, NewUser, UserUpdate, 
  FitnessProfile, NewFitnessProfile, FitnessProfileUpdate,
  UserWithProfile, CreateUserData, CreateFitnessProfileData 
} from './userModel';

export type { 
  Conversation, NewConversation, ConversationUpdate,
  Message, NewMessage, MessageUpdate 
} from './conversationModel';

export type { 
  FitnessPlan, NewFitnessPlan, FitnessPlanUpdate,
  FitnessPlanDB, FitnessProgram, Macrocycle
} from './fitnessPlanModel';

export type { 
  Mesocycle, NewMesocycle, MesocycleUpdate 
} from './mesocycleModel';

export type { 
  Microcycle, NewMicrocycle, MicrocycleUpdate 
} from './microcycleModel';

export type { 
  WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate 
} from './workoutModel';

// Re-export database types from _types
export * from './_types';