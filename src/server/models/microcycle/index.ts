import type { JsonValue, Microcycles } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _MicrocycleOverviewSchema, _MicrocycleSchema, LLMMicrocycle } from "./schema";
import { UserWithProfile } from '../userModel';
import { FitnessPlan } from '../fitnessPlan';
import { Mesocycle } from '../mesocycle';
import { WorkoutInstance, WorkoutInstanceBreakdown } from '../workout';


export type Microcycle = Selectable<Microcycles>;
export type NewMicrocycle = Insertable<Microcycles>;
export type MicrocycleUpdate = Updateable<Microcycles>;


export type MicrocycleBreakdown = LLMMicrocycle & {
  startDate: Date;
  endDate: Date;
  workouts: WorkoutInstanceBreakdown[];
}
export interface MicrocycleOverview {
  index: number;
  split?: string;
  totalMileage?: number;
  longRunMileage?: number;
  avgIntensityPct1RM?: number;
  totalSetsMainLifts?: number;
  deload?: boolean;
}

export interface DetailedMicrocycle extends Microcycle {
  workouts: WorkoutInstance[];
}

export class MicrocycleModel implements NewMicrocycle {
  clientId: string;
  createdAt: Date | string | undefined;
  endDate: Date | string;
  fitnessPlanId: string;
  id: string | undefined;
  index: number;
  mesocycleId: string;
  startDate: Date | string;
  updatedAt: Date | string | undefined;
  targets: JsonValue | undefined;

  constructor(microcycle: NewMicrocycle) {
    this.clientId = microcycle.clientId;
    this.createdAt = microcycle.createdAt;
    this.endDate = microcycle.endDate;
    this.fitnessPlanId = microcycle.fitnessPlanId;
    this.id = microcycle.id;
    this.index = microcycle.index;
    this.mesocycleId = microcycle.mesocycleId;
    this.startDate = microcycle.startDate;
    this.updatedAt = microcycle.updatedAt;
    this.targets = microcycle.targets;
  }

  public static fromLLM(user: UserWithProfile, fitnessPlan: FitnessPlan, mesocycle: Mesocycle, microcycle: Omit<MicrocycleBreakdown, 'workouts'>): NewMicrocycle {
    return {
      ...microcycle,
      clientId: user.id,
      fitnessPlanId: fitnessPlan.id!,
      mesocycleId: mesocycle.id,
    };
  }

  public static overviewSchema = _MicrocycleOverviewSchema;

  public static schema = _MicrocycleSchema;
}