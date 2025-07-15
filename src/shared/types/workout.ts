export interface WorkoutDay {
  day: number;
  date: string;
  exercises: {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
  }[];
}

export interface WeeklyWorkout {
  week: number;
  days: WorkoutDay[];
} 