import { UserWithProfile, WorkoutInstance } from "@/server/models";
import { EnhancedWorkoutInstance } from "@/server/models/workout";
import { Message } from "@/server/models/conversation";

export interface WorkoutMessageInput {
    user: UserWithProfile;
    workout: WorkoutInstance | EnhancedWorkoutInstance;
    type: 'daily' | 'modified';
    context?: WorkoutMessageContext;
    previousMessages?: Message[];
  }
  
  export interface WorkoutMessageOutput {
    user: UserWithProfile;
    workout: WorkoutInstance | EnhancedWorkoutInstance;
    context: WorkoutMessageContext;
    value: string;
  }

  export interface WorkoutMessageContext {
    modificationType?: 'substitute_exercise' | 'modify_workout' | 'modify_week';
    modificationsApplied?: string[];
    reason?: string;
  }  