import { WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate } from './_types';

// Re-export Kysely generated types
export type { WorkoutInstance, NewWorkoutInstance, WorkoutInstanceUpdate };

// Additional workout types
export interface WorkoutWithExercises extends WorkoutInstance {
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workoutId: string;
  exerciseName: string;
  sets: Set[];
  restBetweenSets: string;
  notes?: string;
  order: number;
}

export interface Set {
  setNumber: number;
  reps: number;
  weight?: number;
  duration?: number;
  distance?: number;
  completed: boolean;
}

export interface WorkoutSummary {
  id: string;
  name: string;
  date: Date;
  duration: number;
  exerciseCount: number;
  totalSets: number;
  status: 'planned' | 'in-progress' | 'completed' | 'skipped';
}

// Helper functions
export const calculateWorkoutVolume = (exercises: WorkoutExercise[]): number => {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.weight || 0) * (set.reps || 0);
    }, 0);
  }, 0);
};