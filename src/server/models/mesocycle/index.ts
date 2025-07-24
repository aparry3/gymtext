import type { Mesocycles } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { Microcycle, MicrocycleModel, type MicrocycleOverview } from '@/server/models/microcycle';
import { z } from 'zod';
import { UserWithProfile } from '../userModel';
import { FitnessPlan } from '../fitnessPlan';

export type Mesocycle = Selectable<Mesocycles>;
export type NewMesocycle = Insertable<Mesocycles>;
export type MesocycleUpdate = Updateable<Mesocycles>;


export interface MesocycleOverview {
  index: number;
  phase: string;
  weeks: number;
  microcycleOverviews: MicrocycleOverview[];
}

export interface DetailedMesocycle extends Mesocycle {
  microcycles: Microcycle[];
}

export class MesocycleModel implements Mesocycle {
  id: string;
  phase: string;
  weeks: number;
  microcycleOverviews: MicrocycleOverview[];
  clientId: string;
  createdAt: Date;
  fitnessPlanId: string;
  startDate: Date;
  updatedAt: Date;
  index: number;
  lengthWeeks: number;
  microcycles: Microcycle[];

  constructor(
    id: string, 
    phase: string,
    weeks: number, 
    microcycleOverviews: MicrocycleOverview[], 
    clientId: string, 
    createdAt: Date, 
    fitnessPlanId: string, 
    startDate: Date, 
    updatedAt: Date,
    index: number,
    lengthWeeks: number,
    microcycles: Microcycle[]) {
    this.id = id;
    this.phase = phase;
    this.weeks = weeks;
    this.microcycleOverviews = microcycleOverviews;
    this.clientId = clientId;
    this.createdAt = createdAt;
    this.fitnessPlanId = fitnessPlanId;
    this.startDate = startDate;
    this.updatedAt = updatedAt;
    this.index = index;
    this.lengthWeeks = lengthWeeks;
    this.microcycles = microcycles;
  }

  public static fromOverview(user: UserWithProfile, fitnessPlan: FitnessPlan, mesocycleOverview: MesocycleOverview): NewMesocycle {
    return {
      phase: mesocycleOverview.phase,
      lengthWeeks: mesocycleOverview.weeks,
      fitnessPlanId: fitnessPlan.id!,
      clientId: user.id,
      createdAt: new Date(),
      index: mesocycleOverview.index,
      startDate: fitnessPlan.startDate,
    }
  }

  public static schema = z.object({
    phase: z.string(),
    weeks: z.number(),
    microcycleOverviews: z.array(MicrocycleModel.overviewSchema)
  });

  public static microcyclesSchema = z.array(MicrocycleModel.schema);
}