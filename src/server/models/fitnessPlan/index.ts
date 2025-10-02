import type { FitnessPlans } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _FitnessPlanSchema } from './schema';
import { UserWithProfile } from '../userModel';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

export type FitnessPlan = Omit<NewFitnessPlan, 'mesocycles'> & {
  mesocycles: MesocycleOverview[];
  id?: string;
};

export interface FitnessPlanOverview {
  programType: string;
  lengthWeeks: number; // Total weeks
  mesocycles: MesocycleOverview[];
  overview: string;
  notes?: string; // Travel, injuries, etc.
}

export interface MesocycleOverview {
  name: string; // e.g., "Accumulation"
  weeks: number;
  focus: string[]; // e.g., ["volume", "technique"]
  deload: boolean; // Is last week a deload?
}

export class FitnessPlanModel implements FitnessPlan {
  programType: string;
  mesocycles: MesocycleOverview[];
  lengthWeeks: number | null;
  notes: string | null;
  currentMesocycleIndex: number | null;
  currentMicrocycleWeek: number | null;
  cycleStartDate: Date | null;
  overview: string | null;
  startDate: Date;
  clientId: string;
  createdAt: Date;
  goalStatement: string | null;
  id: string;
  updatedAt: Date;

  constructor(
    programType: string,
    mesocycles: MesocycleOverview[],
    lengthWeeks: number | null,
    notes: string | null,
    currentMesocycleIndex: number | null,
    currentMicrocycleWeek: number | null,
    cycleStartDate: Date | null,
    overview: string,
    startDate: Date,
    clientId: string,
    createdAt: Date,
    goalStatement: string,
    id: string,
    updatedAt: Date
  ) {
    this.programType = programType;
    this.mesocycles = mesocycles;
    this.lengthWeeks = lengthWeeks;
    this.notes = notes;
    this.currentMesocycleIndex = currentMesocycleIndex;
    this.currentMicrocycleWeek = currentMicrocycleWeek;
    this.cycleStartDate = cycleStartDate;
    this.overview = overview;
    this.startDate = startDate;
    this.clientId = clientId;
    this.createdAt = createdAt;
    this.goalStatement = goalStatement;
    this.id = id;
    this.updatedAt = updatedAt;
  }

  public static fromDB(fitnessPlan: FitnessPlanDB): FitnessPlan {
    return {
      ...fitnessPlan,
      mesocycles: (fitnessPlan.mesocycles || []) as unknown as MesocycleOverview[],
    };
  }

  public static fromFitnessPlanOverview(
    user: UserWithProfile,
    fitnessPlanOverview: FitnessPlanOverview
  ): FitnessPlan {
    return {
      programType: fitnessPlanOverview.programType,
      mesocycles: fitnessPlanOverview.mesocycles,
      lengthWeeks: fitnessPlanOverview.lengthWeeks,
      notes: fitnessPlanOverview.notes || null,
      currentMesocycleIndex: 0,
      currentMicrocycleWeek: 0,
      cycleStartDate: new Date(),
      overview: fitnessPlanOverview.overview,
      clientId: user.id,
      startDate: new Date(),
    };
  }

  public static schema = _FitnessPlanSchema;
}