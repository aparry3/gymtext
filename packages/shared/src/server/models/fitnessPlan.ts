import type { FitnessPlans } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _FitnessPlanSchema, type PlanStructure } from '@/shared/types/plan';
import { UserWithProfile } from './user';

// Re-export schema types from shared
export * from '@/shared/types/plan';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

/**
 * Simplified FitnessPlan type
 *
 * Stores:
 * - description: Structured text plan (contains split, frequency, goals, deload rules, etc.)
 * - message: Brief summary for SMS (optional)
 * - structured: Parsed structured plan data for UI rendering
 *
 * Plans are ongoing by default - no fixed duration.
 * All versions are kept (query latest by created_at).
 *
 * As of Phase 2, fitness plans are program versions:
 * - programId: Links to the program this version belongs to
 * - legacyClientId: Legacy field for backward compatibility (was client_id)
 * - publishedAt: When this version was published (null = draft)
 */
export interface FitnessPlan {
  id?: string;
  programId?: string | null;  // New: Links to program
  legacyClientId: string;  // Renamed from clientId for backward compatibility
  publishedAt?: Date | null;  // New: When published
  description: string;  // Structured text plan
  message?: string | null;
  structured?: PlanStructure | null;  // Parsed structured plan data
  startDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Overview returned by fitness plan agent
 */
export interface FitnessPlanOverview {
  description: string;  // Structured text plan
  message?: string;     // SMS-friendly summary
  structure?: PlanStructure; // Structured plan data
}

export class FitnessPlanModel implements FitnessPlan {
  id: string;
  programId: string | null;
  legacyClientId: string;
  publishedAt: Date | null;
  description: string;
  message: string | null;
  structured: PlanStructure | null;
  startDate: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    programId: string | null,
    legacyClientId: string,
    publishedAt: Date | null,
    description: string,
    message: string | null,
    structured: PlanStructure | null,
    startDate: Date,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.programId = programId;
    this.legacyClientId = legacyClientId;
    this.publishedAt = publishedAt;
    this.description = description;
    this.message = message;
    this.structured = structured;
    this.startDate = startDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  public static fromDB(fitnessPlan: FitnessPlanDB): FitnessPlan {
    return {
      id: fitnessPlan.id,
      programId: fitnessPlan.programId,
      legacyClientId: fitnessPlan.legacyClientId,
      publishedAt: fitnessPlan.publishedAt ? new Date(fitnessPlan.publishedAt) : null,
      description: fitnessPlan.description || '',
      message: fitnessPlan.message,
      structured: fitnessPlan.structured as PlanStructure | null,
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
      legacyClientId: user.id,
      description: fitnessPlanOverview.description,
      message: fitnessPlanOverview.message || null,
      structured: fitnessPlanOverview.structure || null,
      startDate: new Date(),
    };
  }

  public static schema = _FitnessPlanSchema;
}
