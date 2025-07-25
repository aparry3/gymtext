import type { FitnessPlans } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { MesocycleOverview } from '../mesocycle';
import { _FitnessPlanSchema } from './schema';
import { UserWithProfile } from '../userModel';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

export type FitnessPlan = Omit<NewFitnessPlan, 'macrocycles'> & {macrocycles: MacrocycleOverview[], id?: string};

export interface FitnessPlanOverview {
  programType: string;
  macrocycles: MacrocycleOverview[];
  overview: string;
}

export interface MacrocycleOverview {
  name: string;
  description: string;
  durationWeeks: number;
  mesocycles: MesocycleOverview[];
}

export class FitnessPlanModel implements FitnessPlan {
  programType: string;
  macrocycles: MacrocycleOverview[];
  overview: string | null;
  startDate: Date;
  clientId: string;
  createdAt: Date;
  goalStatement: string | null;
  id: string;
  updatedAt: Date;

  constructor(
    programType: string, 
    macrocycles: MacrocycleOverview[], 
    overview: string, 
    startDate: Date, 
    clientId: string, 
    createdAt: Date, 
    goalStatement: string, 
    id: string, 
    updatedAt: Date) {

    this.programType = programType;
    this.macrocycles = macrocycles;
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
      macrocycles: (fitnessPlan.macrocycles || []) as unknown as MacrocycleOverview[],
    }
  }

  public static fromFitnessPlanOverview(user: UserWithProfile, fitnessPlanOverview: FitnessPlanOverview): FitnessPlan {
    return {
      programType: fitnessPlanOverview.programType,
      macrocycles: fitnessPlanOverview.macrocycles,
      overview: fitnessPlanOverview.overview,
      clientId: user.id,
      startDate: new Date(),
    }
  }

  public static schema = _FitnessPlanSchema;
}