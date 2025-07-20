import { Microcycle, NewMicrocycle, MicrocycleUpdate } from './_types';

// Re-export Kysely generated types
export type { Microcycle, NewMicrocycle, MicrocycleUpdate };

// Additional microcycle types
export interface MicrocycleWithWorkouts extends Microcycle {
  workouts?: Workout[];
}

export interface Workout {
  id: string;
  microcycleId: string;
  dayOfWeek: number;
  name: string;
  type: string;
  duration: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

export interface MicrocycleSummary {
  id: string;
  weekNumber: number;
  focus: string;
  workoutCount: number;
  completedWorkouts: number;
  intensity: string;
}

// Helper functions
export const getDayName = (dayOfWeek: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || 'Unknown';
};