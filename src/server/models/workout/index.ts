import type { JsonValue, WorkoutInstances } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { UserWithProfile } from '../userModel';
import { FitnessPlan } from '../fitnessPlan';
import { Mesocycle } from '../mesocycle';
import { Microcycle } from '../microcycle';
import { LLMWorkoutInstance } from './schema';
import { mapSessionType } from './sessionTypeMapping';


export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

// Re-export session type utilities
export { mapSessionType, isValidDBSessionType, SESSION_TYPE_MAP, DB_SESSION_TYPES, LLM_SESSION_TYPES } from './sessionTypeMapping';
export type { DBSessionType, LLMSessionType } from './sessionTypeMapping';

export type WorkoutInstanceBreakdown = LLMWorkoutInstance & {
  date: Date;
}

export class WorkoutInstanceModel implements NewWorkoutInstance {
  clientId: string;
  microcycleId: string;
  mesocycleId: string;
  sessionType: string;
  createdAt: Date | string | undefined;
  date: Date | string;
  fitnessPlanId: string;
  id: string | undefined;
  updatedAt: Date | string | undefined;
  goal: string | null | undefined;
  details: JsonValue;
  completedAt: Date | string | null | undefined;

  constructor(workoutInstance: NewWorkoutInstance) {
    this.clientId = workoutInstance.clientId;
    this.createdAt = workoutInstance.createdAt;
    this.date = workoutInstance.date;
    this.fitnessPlanId = workoutInstance.fitnessPlanId;
    this.id = workoutInstance.id;
    this.microcycleId = workoutInstance.microcycleId;
    this.mesocycleId = workoutInstance.mesocycleId;
    this.sessionType = workoutInstance.sessionType;
    this.details = workoutInstance.details!; // Details is required in DB
    this.goal = workoutInstance.goal;
    this.completedAt = workoutInstance.completedAt;
  }

  public static fromLLM(user: UserWithProfile, fitnessPlan: FitnessPlan, mesocycle: Mesocycle, microcycle: Microcycle, workoutBreakdown: WorkoutInstanceBreakdown): NewWorkoutInstance {
    // Extract the LLM data and map session type
    const { sessionType: llmSessionType, details, targets, ...rest } = workoutBreakdown;
    
    // Map LLM session type to DB-compatible session type
    const mappedSessionType = mapSessionType(llmSessionType);
    
    // Convert targets array to a goal string if present
    const goal = targets && targets.length > 0 
      ? targets.map(t => `${t.key}: ${t.value}`).join(', ')
      : null;
    
    return {
      ...rest,
      clientId: user.id,
      fitnessPlanId: fitnessPlan.id!,
      mesocycleId: mesocycle.id,
      microcycleId: microcycle.id,
      sessionType: mappedSessionType,
      details: details, // This is already in the correct format
      goal: goal,
      completedAt: null, // Workouts start as not completed
    };
  }
}