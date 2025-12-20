import type { JsonValue, WorkoutInstances } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';

export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

// Re-export everything from shared workout types
export * from '@/shared/types/workout';

export class WorkoutInstanceModel implements NewWorkoutInstance {
  clientId: string;
  microcycleId: string | null | undefined;
  sessionType: string;
  createdAt: Date | string | undefined;
  date: Date | string;
  id: string | undefined;
  updatedAt: Date | string | undefined;
  goal: string | null | undefined;
  details: JsonValue;
  completedAt: Date | string | null | undefined;

  constructor(workoutInstance: NewWorkoutInstance) {
    this.clientId = workoutInstance.clientId;
    this.createdAt = workoutInstance.createdAt;
    this.date = workoutInstance.date;
    this.id = workoutInstance.id;
    this.microcycleId = workoutInstance.microcycleId;
    this.sessionType = workoutInstance.sessionType;
    this.details = workoutInstance.details!; // Details is required in DB
    this.goal = workoutInstance.goal;
    this.completedAt = workoutInstance.completedAt;
  }
}
