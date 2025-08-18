import { z } from 'zod';

// Constraint schema and interface
export interface Constraint {
  id: string;
  type: 'injury' | 'equipment' | 'schedule' | 'mobility' | 'preference' | 'other';
  label: string;
  severity?: 'mild' | 'moderate' | 'severe';
  affectedAreas?: string[];
  modifications?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'resolved';
}

// Main FitnessProfile interface
export interface FitnessProfile {
  version?: number;
  userId?: string;
  
  // Goals
  primaryGoal?: string;
  specificObjective?: string;
  eventDate?: string;
  timelineWeeks?: number;
  experienceLevel?: string;
  
  // Training status
  currentActivity?: string;
  currentTraining?: {
    programName?: string;
    weeksCompleted?: number;
    focus?: string;
    notes?: string;
  };
  
  // Availability & access
  availability?: {
    daysPerWeek?: number;
    minutesPerSession?: number;
    preferredTimes?: string;
    travelPattern?: string;
    notes?: string;
  };
  
  equipment?: {
    access?: string;
    location?: string;
    items?: string[];
    constraints?: string[];
  };
  
  // Preferences
  preferences?: {
    workoutStyle?: string;
    enjoyedExercises?: string[];
    dislikedExercises?: string[];
    coachingTone?: 'friendly' | 'tough-love' | 'clinical' | 'cheerleader';
    musicOrVibe?: string;
  };
  
  // Metrics
  metrics?: {
    heightCm?: number;
    bodyweight?: { value: number; unit: 'lbs' | 'kg' };
    bodyFatPercent?: number;
    prLifts?: Record<string, { weight: number; unit: 'lbs' | 'kg'; reps?: number; date?: string }>;
  };
  
  // Constraints
  constraints?: Constraint[];
  
  // Identity
  identity?: {
    age?: number;
    gender?: string;
    pronouns?: string;
  };
  
  // Lifestyle
  lifestyle?: {
    sleepHours?: number;
    stressLevel?: 'low' | 'moderate' | 'high';
    nutritionFocus?: string;
    hydrationLiters?: number;
    occupation?: string;
    activityLevel?: string;
  };
  
  // History
  history?: {
    yearsTraining?: number;
    sportsBackground?: string[];
    previousPrograms?: string[];
    bestResults?: string;
    challenges?: string[];
  };
}

// Profile update operations
export type ProfileUpdateOp =
  | { kind: 'add_constraint'; constraint: Omit<Constraint, 'id'|'status'> & { id?: string; status?: 'active' } }
  | { kind: 'update_constraint'; id: string; patch: Partial<Constraint> }
  | { kind: 'resolve_constraint'; id: string; endDate?: string }
  | { kind: 'set'; path: string; value: unknown };

// Zod schemas for validation
export const ConstraintSchema = z.object({
  id: z.string(),
  type: z.enum(['injury', 'equipment', 'schedule', 'mobility', 'preference', 'other']),
  label: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe']).optional(),
  affectedAreas: z.array(z.string()).optional(),
  modifications: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'resolved']),
});

export const FitnessProfileSchema = z.object({
  version: z.number().optional(),
  userId: z.string().optional(),
  
  primaryGoal: z.string().optional(),
  specificObjective: z.string().optional(),
  eventDate: z.string().optional(),
  timelineWeeks: z.number().optional(),
  experienceLevel: z.string().optional(),
  
  currentActivity: z.string().optional(),
  currentTraining: z.object({
    programName: z.string().optional(),
    weeksCompleted: z.number().optional(),
    focus: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  availability: z.object({
    daysPerWeek: z.number().optional(),
    minutesPerSession: z.number().optional(),
    preferredTimes: z.string().optional(),
    travelPattern: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
  
  equipment: z.object({
    access: z.string().optional(),
    location: z.string().optional(),
    items: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }).optional(),
  
  preferences: z.object({
    workoutStyle: z.string().optional(),
    enjoyedExercises: z.array(z.string()).optional(),
    dislikedExercises: z.array(z.string()).optional(),
    coachingTone: z.enum(['friendly', 'tough-love', 'clinical', 'cheerleader']).optional(),
    musicOrVibe: z.string().optional(),
  }).optional(),
  
  metrics: z.object({
    heightCm: z.number().optional(),
    bodyweight: z.object({ value: z.number(), unit: z.enum(['lbs', 'kg']) }).optional(),
    bodyFatPercent: z.number().optional(),
    prLifts: z.record(z.object({
      weight: z.number(),
      unit: z.enum(['lbs', 'kg']),
      reps: z.number().optional(),
      date: z.string().optional(),
    })).optional(),
  }).optional(),
  
  constraints: z.array(ConstraintSchema).optional(),
  
  identity: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    pronouns: z.string().optional(),
  }).optional(),
  
  lifestyle: z.object({
    sleepHours: z.number().optional(),
    stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
    nutritionFocus: z.string().optional(),
    hydrationLiters: z.number().optional(),
    occupation: z.string().optional(),
    activityLevel: z.string().optional(),
  }).optional(),
  
  history: z.object({
    yearsTraining: z.number().optional(),
    sportsBackground: z.array(z.string()).optional(),
    previousPrograms: z.array(z.string()).optional(),
    bestResults: z.string().optional(),
    challenges: z.array(z.string()).optional(),
  }).optional(),
});

// Type helpers
export type FitnessProfileInput = z.infer<typeof FitnessProfileSchema>;
export type ConstraintInput = z.infer<typeof ConstraintSchema>;