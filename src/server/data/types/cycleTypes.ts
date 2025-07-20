import type { Insertable, Selectable, Updateable } from "kysely";
import type { Mesocycles, Microcycles, WorkoutInstances } from "@/shared/types/generated";
import type { 
  MesocycleDetailed, 
  Microcycle, 
  WorkoutInstance,
  WeeklyTarget 
} from "@/shared/types/cycles";
import { v4 as uuidv4 } from 'uuid';

// Type aliases for Kysely operations
export type MesocycleRow = Selectable<Mesocycles>;
export type NewMesocycle = Insertable<Mesocycles>;
export type MesocycleUpdate = Updateable<Mesocycles>;

export type MicrocycleRow = Selectable<Microcycles>;
export type NewMicrocycle = Insertable<Microcycles>;
export type MicrocycleUpdate = Updateable<Microcycles>;

export type WorkoutInstanceRow = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

// Conversion functions from AI-generated types to database types

/**
 * Converts a MesocycleDetailed (from AI) to a database insert object
 */
export function mesocycleDetailedToDb(
  mesocycle: MesocycleDetailed,
  fitnessPlanId: string,
  clientId: string,
  cycleOffset: number,
  startDate: Date
): NewMesocycle {
  const lengthWeeks = mesocycle.weeks;
  
  return {
    id: uuidv4(), // Generate a proper UUID instead of using the AI-generated ID
    fitnessPlanId,
    clientId,
    phase: mesocycle.phase,
    lengthWeeks,
    cycleOffset,
    startDate
  };
}

/**
 * Converts a Microcycle (from AI) to a database insert object
 */
export function microcycleToDb(
  microcycle: Microcycle,
  mesocycleId: string,
  fitnessPlanId: string,
  clientId: string,
  cycleOffset: number,
  startDate: Date,
  endDate: Date
): NewMicrocycle {
  // Convert metrics array to JSON object if present
  const targets = microcycle.metrics 
    ? microcycle.metrics.reduce((acc, kv) => {
        acc[kv.key] = kv.value;
        return acc;
      }, {} as Record<string, number>)
    : null;

  return {
    mesocycleId,
    fitnessPlanId,
    clientId,
    weekNumber: microcycle.weekNumber,
    cycleOffset,
    startDate,
    endDate,
    targets
  };
}

/**
 * Converts a WorkoutInstance (from AI) to a database insert object
 */
/**
 * Map AI session types to database session types
 */
function mapSessionType(aiType: string): string {
  const typeMap: Record<string, string> = {
    'run': 'cardio',
    'lift': 'strength',
    'metcon': 'cardio',
    'mobility': 'mobility',
    'rest': 'recovery',
    'other': 'recovery'
  };
  
  return typeMap[aiType] || 'recovery';
}

export function workoutInstanceToDb(
  workout: WorkoutInstance,
  microcycleId: string,
  mesocycleId: string,
  fitnessPlanId: string,
  clientId: string
): NewWorkoutInstance {
  // Convert blocks to details JSON
  const details = {
    blocks: workout.blocks,
    originalId: workout.id, // Preserve original ID from AI
    originalSessionType: workout.sessionType, // Preserve original session type
    targets: workout.targets // Store targets in details since metrics field is removed
  };

  return {
    id: uuidv4(), // Generate a proper UUID instead of using the AI-generated ID
    microcycleId,
    mesocycleId,
    fitnessPlanId,
    clientId,
    date: new Date(workout.date),
    sessionType: mapSessionType(workout.sessionType), // Map to DB-compatible type
    details,
    goal: null,
    alterations: null,
    completedAt: null
  };
}

/**
 * Type for WeeklyTarget JSON representation
 */
export interface WeeklyTargetJson {
  weekOffset: number;
  split?: string;
  totalMileage?: number;
  longRunMileage?: number;
  avgIntensityPct1RM?: number;
  totalSetsMainLifts?: number;
  deload?: boolean;
}

/**
 * Converts WeeklyTargets from AI format to database JSON format
 */
export function weeklyTargetsToJson(targets: WeeklyTarget[]): WeeklyTargetJson[] {
  return targets.map(target => {
    const result: WeeklyTargetJson = {
      weekOffset: target.weekOffset
    };
    
    // Add all optional fields if they exist
    if (target.split !== undefined) result.split = target.split;
    if (target.totalMileage !== undefined) result.totalMileage = target.totalMileage;
    if (target.longRunMileage !== undefined) result.longRunMileage = target.longRunMileage;
    if (target.avgIntensityPct1RM !== undefined) result.avgIntensityPct1RM = target.avgIntensityPct1RM;
    if (target.totalSetsMainLifts !== undefined) result.totalSetsMainLifts = target.totalSetsMainLifts;
    if (target.deload !== undefined) result.deload = target.deload;
    
    return result;
  });
}

/**
 * Helper to calculate microcycle dates based on mesocycle start and week number
 * Enhanced to properly handle transition weeks (week 0) for non-Monday starts
 */
export function calculateMicrocycleDates(
  mesocycleStartDate: Date,
  weekNumber: number,
  isTransitionWeek?: boolean
): { startDate: Date; endDate: Date } {
  const startDate = new Date(mesocycleStartDate);
  
  if (isTransitionWeek || weekNumber === 0) {
    // Transition week: runs from start date to Sunday (or Saturday if starting Sunday)
    const endDate = new Date(startDate);
    const dayOfWeek = startDate.getDay();
    
    if (dayOfWeek === 0) {
      // Sunday start: transition week goes to next Saturday
      endDate.setDate(endDate.getDate() + 6);
    } else {
      // Any other day: transition week goes to Sunday
      const daysUntilSunday = 7 - dayOfWeek;
      endDate.setDate(endDate.getDate() + daysUntilSunday);
    }
    
    return { startDate, endDate };
  } else {
    // Regular weeks: calculate from the Monday after transition
    const dayOfWeek = mesocycleStartDate.getDay();
    let daysToMonday: number;
    
    if (dayOfWeek === 1) {
      // Already Monday, no offset needed
      daysToMonday = 0;
    } else if (dayOfWeek === 0) {
      // Sunday: next Monday is 1 day away
      daysToMonday = 1;
    } else {
      // Tuesday-Saturday: calculate days until next Monday
      daysToMonday = 8 - dayOfWeek;
    }
    
    const mondayStart = new Date(mesocycleStartDate);
    mondayStart.setDate(mondayStart.getDate() + daysToMonday);
    
    // Now calculate based on adjusted week number
    const adjustedStartDate = new Date(mondayStart);
    adjustedStartDate.setDate(adjustedStartDate.getDate() + (weekNumber - 1) * 7);
    
    const endDate = new Date(adjustedStartDate);
    endDate.setDate(endDate.getDate() + 6);
    
    return { startDate: adjustedStartDate, endDate };
  }
}

/**
 * Helper to calculate mesocycle end date
 */
export function calculateMesocycleEndDate(startDate: Date, weeks: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (weeks * 7) - 1);
  return endDate;
}