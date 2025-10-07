import type { JsonValue, WorkoutInstances } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { 
  LLMWorkoutInstance
} from './schema';


export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

// Re-export session type utilities
export { mapSessionType, isValidDBSessionType, SESSION_TYPE_MAP, DB_SESSION_TYPES, LLM_SESSION_TYPES } from './sessionTypeMapping';
export type { DBSessionType, LLMSessionType } from './sessionTypeMapping';

export type WorkoutInstanceBreakdown = LLMWorkoutInstance & {
  date: Date;
}

// Export new enhanced types
export type {
  WorkoutBlock,
  WorkoutBlockItem,
  WorkoutModification,
  EnhancedWorkoutInstance,
  UpdatedWorkoutInstance
} from './schema';

export class WorkoutInstanceModel implements NewWorkoutInstance {
  clientId: string;
  microcycleId: string | null | undefined;
  mesocycleId: string | null | undefined;
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
}