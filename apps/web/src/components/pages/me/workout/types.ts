/**
 * Activity types that determine how tracking is displayed
 */
export type ActivityType = 'strength' | 'cardio' | 'mobility';

/**
 * Tracking data for a single set in strength exercises
 */
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

/**
 * Tracking data for cardio exercises
 */
export interface CardioTrackingData {
  durationMinutes: string;
  durationSeconds: string;
  distance: string;
  distanceUnit: 'km' | 'mi';
  completed: boolean;
}

/**
 * Tracking data for mobility exercises
 */
export interface MobilityTrackingData {
  durationMinutes: string;
  durationSeconds: string;
  completed: boolean;
}

/**
 * State for tracking a single exercise
 */
export interface ExerciseTrackingState {
  /** Local key for the exercise in the workout structure */
  exerciseId: string;
  /** UUID of the resolved exercise from the exercises table (for saving to DB) */
  resolvedExerciseId?: string;
  /** Type of activity determines which tracking UI to show */
  activityType: ActivityType;
  /** Set tracking data (for strength exercises) */
  sets: SetTrackingData[];
  /** Cardio tracking data (for cardio exercises) */
  cardio?: CardioTrackingData;
  /** Mobility tracking data (for mobility exercises) */
  mobility?: MobilityTrackingData;
}

/**
 * State for tracking all exercises in a workout
 * Keyed by the local exercise key (sectionIdx-exerciseIdx or exercise.id)
 */
export interface WorkoutTrackingState {
  [exerciseKey: string]: ExerciseTrackingState;
}
