import type { FitnessPlans } from '../_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _FitnessPlanSchema } from './schema';
import { UserWithProfile } from '../userModel';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

/**
 * Simplified FitnessPlan type
 *
 * Stores:
 * - description: Long-form plan with all details and reasoning
 * - mesocycles: Array of mesocycle overview strings
 * - summary: Brief summary for SMS (optional, from message field)
 * - notes: Special considerations (optional)
 */
export type FitnessPlan = Omit<NewFitnessPlan, 'mesocycles'> & {
  mesocycles: string[];
  id?: string;
};

/**
 * Overview returned by fitness plan agent
 */
export interface FitnessPlanOverview {
  description: string; // Long-form plan description with mesocycle delimiters
  mesocycles: string[]; // Extracted mesocycle overviews
  summary?: string; // Brief summary for SMS
  notes?: string; // Special considerations
  message?: string; // SMS-formatted plan message
}

/**
 * DEPRECATED: Legacy Mesocycle interface for backward compatibility
 * This interface is kept to support legacy code that hasn't been migrated yet.
 * New code should use mesocycle strings directly from FitnessPlan.mesocycles
 */
export interface Mesocycle {
  name: string;
  objective?: string;
  focus?: string[];
  durationWeeks?: number;
  startWeek?: number;
  endWeek?: number;
  volumeTrend?: "increasing" | "stable" | "decreasing";
  intensityTrend?: "increasing" | "stable" | "taper";
  conditioningFocus?: string;
  weeklyVolumeTargets?: Record<string, number>;
  avgRIRRange?: [number, number];
  keyThemes?: string[];
  longFormDescription?: string;
  microcycles?: string[];
}

export class FitnessPlanModel implements FitnessPlan {
  programType: string;
  mesocycles: string[];
  lengthWeeks: number | null;
  notes: string | null;
  description: string | null;
  startDate: Date;
  clientId: string;
  createdAt: Date;
  goalStatement: string | null;
  id: string;
  updatedAt: Date;
  message: string | null;

  constructor(
    programType: string,
    mesocycles: string[],
    lengthWeeks: number | null,
    notes: string | null,
    description: string | null,
    startDate: Date,
    clientId: string,
    createdAt: Date,
    goalStatement: string | null,
    id: string,
    updatedAt: Date,
    message: string | null
  ) {
    this.programType = programType;
    this.mesocycles = mesocycles;
    this.lengthWeeks = lengthWeeks;
    this.notes = notes;
    this.description = description;
    this.startDate = startDate;
    this.clientId = clientId;
    this.createdAt = createdAt;
    this.goalStatement = goalStatement;
    this.id = id;
    this.updatedAt = updatedAt;
    this.message = message;
  }

  public static fromDB(fitnessPlan: FitnessPlanDB): FitnessPlan {
    return {
      ...fitnessPlan,
      mesocycles: fitnessPlan.mesocycles || [],
    };
  }

  public static fromFitnessPlanOverview(
    user: UserWithProfile,
    fitnessPlanOverview: FitnessPlanOverview
  ): FitnessPlan {
    // Calculate lengthWeeks from mesocycles count (estimate)
    // Each mesocycle is typically 4-8 weeks, but we'll use a default of 4 for now
    // This can be extracted from the description if needed
    const estimatedWeeks = fitnessPlanOverview.mesocycles.length * 4;

    return {
      programType: 'other', // Default, can be extracted from description if needed
      mesocycles: fitnessPlanOverview.mesocycles,
      lengthWeeks: estimatedWeeks,
      notes: fitnessPlanOverview.notes || null,
      description: fitnessPlanOverview.description,
      message: fitnessPlanOverview.message || fitnessPlanOverview.summary || null,
      clientId: user.id,
      startDate: new Date(),
      goalStatement: null,
    };
  }

  public static schema = _FitnessPlanSchema;
}