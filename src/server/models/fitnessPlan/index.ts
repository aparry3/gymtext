import type { FitnessPlans } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _FitnessPlanSchema } from './schema';
import { UserWithProfile } from '../userModel';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

export type FitnessPlan = Omit<NewFitnessPlan, 'mesocycles' | 'currentMesocycleIndex' | 'currentMicrocycleWeek' | 'cycleStartDate'> & {
  mesocycles: Mesocycle[];
  id?: string;
  message?: string | null; // SMS-formatted plan summary
};

export interface FitnessPlanOverview {
  programType: string;
  lengthWeeks: number; // Total weeks
  mesocycles: Mesocycle[];
  overview: string;
  planDescription: string; // Long-form explanation of plan structure
  reasoning: string; // Detailed decision-making rationale
  notes?: string; // Travel, injuries, etc.
  message?: string; // SMS-formatted plan summary
}

export interface Mesocycle {
  name: string; // e.g., "Accumulation", "Intensification"
  objective: string; // Main objective for this phase
  focus: string[]; // Key focus areas, e.g., ["hypertrophy", "volume tolerance"]
  durationWeeks: number; // Total duration of the mesocycle in weeks
  startWeek: number; // Starting week number relative to full plan
  endWeek: number; // Ending week number relative to full plan
  volumeTrend: "increasing" | "stable" | "decreasing"; // How volume changes
  intensityTrend: "increasing" | "stable" | "taper"; // How intensity changes
  conditioningFocus?: string; // Optional conditioning focus
  weeklyVolumeTargets?: Record<string, number>; // Sets per muscle group, e.g., { chest: 14, back: 16 }
  avgRIRRange?: [number, number]; // Optional RIR range
  keyThemes?: string[]; // Optional key themes
  longFormDescription: string; // Full natural-language explanation
  microcycles: string[]; // Long-form description of each week
}

export class FitnessPlanModel implements FitnessPlan {
  programType: string;
  mesocycles: Mesocycle[];
  lengthWeeks: number | null;
  notes: string | null;
  overview: string | null;
  planDescription: string | null;
  reasoning: string | null;
  startDate: Date;
  clientId: string;
  createdAt: Date;
  goalStatement: string | null;
  id: string;
  updatedAt: Date;

  constructor(
    programType: string,
    mesocycles: Mesocycle[],
    lengthWeeks: number | null,
    notes: string | null,
    overview: string,
    planDescription: string | null,
    reasoning: string | null,
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
    this.overview = overview;
    this.planDescription = planDescription;
    this.reasoning = reasoning;
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
      mesocycles: (fitnessPlan.mesocycles || []) as unknown as Mesocycle[],
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
      overview: fitnessPlanOverview.overview,
      planDescription: fitnessPlanOverview.planDescription,
      reasoning: fitnessPlanOverview.reasoning,
      message: fitnessPlanOverview.message || null,
      clientId: user.id,
      startDate: new Date(),
    };
  }

  public static schema = _FitnessPlanSchema;
}