import type { JsonValue, WorkoutInstances } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { UserWithProfile } from '../userModel';
import { FitnessPlan } from '../fitnessPlan';
import { Mesocycle } from '../mesocycle';
import { Microcycle } from '../microcycle';
import { LLMWorkoutInstance } from './schema';


export type WorkoutInstance = Selectable<WorkoutInstances>;
export type NewWorkoutInstance = Insertable<WorkoutInstances>;
export type WorkoutInstanceUpdate = Updateable<WorkoutInstances>;

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
  targets: JsonValue | undefined;

  constructor(workoutInstance: NewWorkoutInstance) {
    this.clientId = workoutInstance.clientId;
    this.createdAt = workoutInstance.createdAt;
    this.date = workoutInstance.date;
    this.fitnessPlanId = workoutInstance.fitnessPlanId;
    this.id = workoutInstance.id;
    this.microcycleId = workoutInstance.microcycleId;
    this.mesocycleId = workoutInstance.mesocycleId;
    this.sessionType = workoutInstance.sessionType;
  }

  public static fromLLM(user: UserWithProfile, fitnessPlan: FitnessPlan, mesocycle: Mesocycle, microcycle: Microcycle, workoutBreakdown: WorkoutInstanceBreakdown): NewWorkoutInstance {
    return {
      ...workoutBreakdown,
      clientId: user.id,
      fitnessPlanId: fitnessPlan.id!,
      mesocycleId: mesocycle.id,
      microcycleId: microcycle.id,
    };
  }
}