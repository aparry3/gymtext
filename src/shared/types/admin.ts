import type { 
  Users, 
  FitnessProfiles, 
  FitnessPlans, 
  Mesocycles, 
  Microcycles, 
  WorkoutInstances 
} from './generated';
import type { Selectable } from 'kysely';

// Database record types
export type UserRecord = Selectable<Users>;
export type FitnessProfileRecord = Selectable<FitnessProfiles>;
export type FitnessPlanRecord = Selectable<FitnessPlans>;
export type MesocycleRecord = Selectable<Mesocycles>;
export type MicrocycleRecord = Selectable<Microcycles>;
export type WorkoutInstanceRecord = Selectable<WorkoutInstances>;

// Workout block structure
export interface WorkoutBlock {
  label: string;
  activities: string[];
}

// Workout target structure
export interface WorkoutTarget {
  key: string;
  value: number;
}

// Workout details structure - matches actual database structure
export interface WorkoutDetails {
  blocks?: WorkoutBlock[];
  originalId?: string;
  originalSessionType?: string;
  targets?: WorkoutTarget[];
  // Legacy structure support
  exercises?: Array<{
    name: string;
    sets: number;
    reps: string;
    weight?: string;
    rest?: string;
    notes?: string;
  }>;
  duration?: string;
  notes?: string;
}

// Extended types with nested relationships
export type WorkoutInstanceWithDetails = Omit<WorkoutInstanceRecord, 'details'> & {
  details: WorkoutDetails;
};

export interface MicrocycleWithWorkouts extends MicrocycleRecord {
  workouts: WorkoutInstanceWithDetails[];
}

export interface MesocycleWithMicrocycles extends MesocycleRecord {
  microcycles: MicrocycleWithWorkouts[];
}

export interface FitnessPlanWithHierarchy extends FitnessPlanRecord {
  mesocycles: MesocycleWithMicrocycles[];
}

// API Response types
export interface UserFitnessPlanSearchResponse {
  user: {
    id: string;
    name: string;
    phoneNumber: string;
    email: string | null;
  };
  fitnessProfile: FitnessProfileRecord | null;
  fitnessPlans: FitnessPlanWithHierarchy[];
}

// Service layer types
export interface UserFitnessPlanData {
  user: UserRecord;
  fitnessProfile: FitnessProfileRecord | null;
  fitnessPlans: FitnessPlanWithHierarchy[];
}

export interface FitnessPlanDetails extends FitnessPlanWithHierarchy {
  user: UserRecord;
  fitnessProfile: FitnessProfileRecord | null;
}

// Admin search result type
export interface AdminSearchResult {
  success: boolean;
  data?: UserFitnessPlanSearchResponse;
  error?: string;
}