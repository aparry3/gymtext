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
 * - description: Structured text plan (contains split, frequency, goals, deload rules, etc.)
 * - formatted: Markdown-formatted plan for frontend display
 * - message: Brief summary for SMS (optional)
 *
 * Plans are ongoing by default - no fixed duration.
 * All versions are kept (query latest by created_at).
 */
export interface FitnessPlan {
  id?: string;
  clientId: string;
  description: string;  // Structured text plan
  formatted?: string | null;
  message?: string | null;
  startDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Overview returned by fitness plan agent
 */
export interface FitnessPlanOverview {
  description: string;  // Structured text plan
  formatted: string;    // Markdown-formatted plan for frontend display
  message?: string;     // SMS-friendly summary
}

export class FitnessPlanModel implements FitnessPlan {
  id: string;
  clientId: string;
  description: string;
  formatted: string | null;
  message: string | null;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    clientId: string,
    description: string,
    formatted: string | null,
    message: string | null,
    startDate: Date,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.clientId = clientId;
    this.description = description;
    this.formatted = formatted;
    this.message = message;
    this.startDate = startDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static fromDB(fitnessPlan: FitnessPlanDB): FitnessPlan {
    return {
      id: fitnessPlan.id,
      clientId: fitnessPlan.clientId,
      description: fitnessPlan.description || '',
      formatted: fitnessPlan.formatted,
      message: fitnessPlan.message,
      startDate: new Date(fitnessPlan.startDate as unknown as string | number | Date),
      createdAt: new Date(fitnessPlan.createdAt as unknown as string | number | Date),
      updatedAt: new Date(fitnessPlan.updatedAt as unknown as string | number | Date),
    };
  }

  public static fromFitnessPlanOverview(
    user: UserWithProfile,
    fitnessPlanOverview: FitnessPlanOverview
  ): FitnessPlan {
    return {
      clientId: user.id,
      description: fitnessPlanOverview.description,
      formatted: fitnessPlanOverview.formatted,
      message: fitnessPlanOverview.message || null,
      startDate: new Date(),
    };
  }

  public static schema = _FitnessPlanSchema;
}
