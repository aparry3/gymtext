import { UserWithProfile, WorkoutInstance } from "@/server/models";
import { EnhancedWorkoutInstance } from "@/server/models/workout";

export interface WorkoutMessageInput {
    user: UserWithProfile;
    workout: WorkoutInstance | EnhancedWorkoutInstance;
    type: 'daily' | 'modified';
    context?: WorkoutMessageContext;
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