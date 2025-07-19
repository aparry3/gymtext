import { z } from "zod";
import type { Insertable, Selectable, Updateable } from "kysely";
import type { Mesocycles, Microcycles, WorkoutInstances } from "@/shared/types/generated";
import { 
  MesocycleDetailed, 
  Microcycle, 
  WorkoutInstance,
  WeeklyTarget 
} from "@/shared/types/cycles";

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
    id: mesocycle.id,
    fitnessPlanId,
    clientId,
    phase: mesocycle.phase,
    lengthWeeks,
    cycleOffset,
    startDate,
    status: "pending"
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
    targets,
    actualMetrics: null,
    status: "pending"
  };
}

/**
 * Converts a WorkoutInstance (from AI) to a database insert object
 */
export function workoutInstanceToDb(
  workout: WorkoutInstance,
  microcycleId: string,
  mesocycleId: string,
  fitnessPlanId: string,
  clientId: string
): NewWorkoutInstance {
  // Convert targets array to JSON object if present
  const metrics = workout.targets
    ? workout.targets.reduce((acc, kv) => {
        acc[kv.key] = kv.value;
        return acc;
      }, {} as Record<string, number>)
    : null;

  // Convert blocks to details JSON
  const details = {
    blocks: workout.blocks,
    originalId: workout.id // Preserve original ID from AI
  };

  return {
    id: workout.id, // Use the AI-generated ID
    microcycleId,
    mesocycleId,
    fitnessPlanId,
    clientId,
    date: new Date(workout.date),
    sessionType: workout.sessionType,
    details,
    metrics,
    goal: null,
    alterations: null,
    feedback: null,
    completedAt: null,
    status: "scheduled"
  };
}

/**
 * Converts WeeklyTargets from AI format to database JSON format
 */
export function weeklyTargetsToJson(targets: WeeklyTarget[]): Record<string, any>[] {
  return targets.map(target => {
    const result: Record<string, any> = {
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
 */
export function calculateMicrocycleDates(
  mesocycleStartDate: Date,
  weekNumber: number
): { startDate: Date; endDate: Date } {
  const startDate = new Date(mesocycleStartDate);
  startDate.setDate(startDate.getDate() + (weekNumber - 1) * 7);
  
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  
  return { startDate, endDate };
}

/**
 * Helper to calculate mesocycle end date
 */
export function calculateMesocycleEndDate(startDate: Date, weeks: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (weeks * 7) - 1);
  return endDate;
}