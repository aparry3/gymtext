import type { FitnessPlans } from './_types';
import { Insertable, Selectable, Updateable } from 'kysely';
import { _FitnessPlanSchema, type PlanStructure } from '@/shared/types/plan';
import { UserWithProfile } from './user';
import type { StructuredProfile } from './profile';

// Re-export schema types from shared
export * from '@/shared/types/plan';

export type FitnessPlanDB = Selectable<FitnessPlans>;
export type NewFitnessPlan = Insertable<FitnessPlans>;
export type FitnessPlanUpdate = Updateable<FitnessPlans>;

/**
 * Plan instance status
 */
export type PlanStatus = 'active' | 'paused' | 'completed' | 'abandoned';

/**
 * Current state tracking for a plan instance
 */
export interface PlanCurrentState {
  /** Current week number (1-indexed) */
  currentWeek: number;
  /** Current day within the week */
  currentDay?: number;
  /** Total workouts completed */
  workoutsCompleted: number;
  /** Last workout date */
  lastWorkoutDate?: string;
  /** Modifications made to the plan */
  modifications?: Array<{
    date: string;
    type: 'adjustment' | 'skip' | 'swap';
    reason?: string;
  }>;
}

/**
 * FitnessPlan type - User Plan Instance
 *
 * As of Phase 3, fitness plans are user-specific instances of program versions:
 * - programVersionId: The version this was compiled from (the "recipe")
 * - clientId: The user this plan belongs to
 * - status: Instance lifecycle status
 * - personalizationSnapshot: Frozen user profile at creation time
 * - currentState: Progress tracking within the plan
 *
 * Legacy fields maintained for backward compatibility:
 * - programId: Direct FK for convenience queries
 * - legacyClientId: Original client_id field
 * - publishedAt: When this plan iteration was created
 *
 * Plan Versioning Model: Multiple fitness_plan records can exist for the same
 * user + program_version. Each represents a point-in-time snapshot.
 * Query latest by `published_at DESC`.
 */
export interface FitnessPlan {
  id?: string;
  // New instance-specific fields
  clientId?: string | null;  // Explicit user reference
  programVersionId?: string | null;  // The version this was compiled from
  status?: PlanStatus | null;  // Instance lifecycle status
  personalizationSnapshot?: StructuredProfile | null;  // Frozen user profile at creation
  currentState?: PlanCurrentState | null;  // Progress tracking
  // Legacy/convenience fields
  programId?: string | null;  // Direct FK for convenience queries
  legacyClientId: string;  // Backward compatibility (was client_id)
  publishedAt?: Date | null;  // When this plan iteration was created
  // Plan content
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
  clientId: string | null;
  programVersionId: string | null;
  status: PlanStatus | null;
  personalizationSnapshot: StructuredProfile | null;
  currentState: PlanCurrentState | null;
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
    clientId: string | null,
    programVersionId: string | null,
    status: PlanStatus | null,
    personalizationSnapshot: StructuredProfile | null,
    currentState: PlanCurrentState | null,
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
    this.clientId = clientId;
    this.programVersionId = programVersionId;
    this.status = status;
    this.personalizationSnapshot = personalizationSnapshot;
    this.currentState = currentState;
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
      clientId: fitnessPlan.clientId,
      programVersionId: fitnessPlan.programVersionId,
      status: fitnessPlan.status as PlanStatus | null,
      personalizationSnapshot: fitnessPlan.personalizationSnapshot as StructuredProfile | null,
      currentState: fitnessPlan.currentState as PlanCurrentState | null,
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
    fitnessPlanOverview: FitnessPlanOverview,
    options?: {
      programVersionId?: string;
      programId?: string;
    }
  ): FitnessPlan {
    return {
      clientId: user.id,
      legacyClientId: user.id,
      programVersionId: options?.programVersionId ?? null,
      programId: options?.programId ?? null,
      status: 'active',
      description: fitnessPlanOverview.description,
      message: fitnessPlanOverview.message || null,
      structured: fitnessPlanOverview.structure || null,
      startDate: new Date(),
    };
  }

  public static schema = _FitnessPlanSchema;
}
