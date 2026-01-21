export interface SetTrackingData {
  id: string;
  setNumber: number;
  targetReps: string;
  prevWeight?: number;
  prevReps?: number;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface ExerciseTrackingState {
  exerciseId: string;
  sets: SetTrackingData[];
}

export interface WorkoutTrackingState {
  [exerciseId: string]: ExerciseTrackingState;
}
