import type { RepositoryContainer } from '../../../repositories/factory';
import type { FitnessPlan, NewFitnessPlan, PlanStructure } from '../../../models/fitnessPlan';
import type { ProgramVersion } from '../../../models/programVersion';
import type { StructuredProfile } from '../../../models/profile';

/**
 * Plan instance status
 */
export type PlanInstanceStatus = 'active' | 'paused' | 'completed' | 'abandoned';

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
 * Options for creating a plan instance
 */
export interface CreatePlanInstanceOptions {
  clientId: string;
  programVersionId: string;
  programId?: string;
  /** Plan content (from AI generation or version template) */
  description: string;
  message?: string;
  structured?: PlanStructure;
  /** User profile snapshot at creation time */
  personalizationSnapshot?: StructuredProfile;
  startDate?: Date;
}

/**
 * Plan Instance Service Instance Interface
 *
 * Manages fitness plan instances - the personalized "meals" compiled from
 * program version "recipes". Handles:
 * - Creating instances from program versions
 * - Tracking progress within instances
 * - Managing instance lifecycle (pause, resume, complete, abandon)
 * - Querying instance history
 */
export interface PlanInstanceServiceInstance {
  /**
   * Create a new plan instance from a program version
   */
  createFromVersion(options: CreatePlanInstanceOptions): Promise<FitnessPlan>;

  /**
   * Get the current active plan instance for a client
   */
  getCurrentInstance(clientId: string): Promise<FitnessPlan | null>;

  /**
   * Get a plan instance by ID
   */
  getById(id: string): Promise<FitnessPlan | null>;

  /**
   * Get all plan instances for a client
   */
  getInstanceHistory(clientId: string): Promise<FitnessPlan[]>;

  /**
   * Get all plan instances for a specific program version
   */
  getByProgramVersionId(programVersionId: string): Promise<FitnessPlan[]>;

  /**
   * Update instance status
   */
  updateStatus(instanceId: string, status: PlanInstanceStatus): Promise<FitnessPlan | null>;

  /**
   * Update current state (progress tracking)
   */
  updateCurrentState(instanceId: string, state: PlanCurrentState): Promise<FitnessPlan | null>;

  /**
   * Pause a plan instance
   */
  pause(instanceId: string): Promise<FitnessPlan | null>;

  /**
   * Resume a paused plan instance
   */
  resume(instanceId: string): Promise<FitnessPlan | null>;

  /**
   * Mark a plan instance as completed
   */
  complete(instanceId: string): Promise<FitnessPlan | null>;

  /**
   * Mark a plan instance as abandoned
   */
  abandon(instanceId: string): Promise<FitnessPlan | null>;

  /**
   * Count active instances for a program version
   */
  countActiveByVersionId(programVersionId: string): Promise<number>;
}

/**
 * Create a PlanInstanceService instance with injected repositories
 */
export function createPlanInstanceService(
  repos: RepositoryContainer
): PlanInstanceServiceInstance {
  return {
    async createFromVersion(options: CreatePlanInstanceOptions): Promise<FitnessPlan> {
      const {
        clientId,
        programVersionId,
        programId,
        description,
        message,
        structured,
        personalizationSnapshot,
        startDate = new Date(),
      } = options;

      // Build the plan data - handle both old schema (legacyClientId) and new schema (clientId only)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const planData: any = {
        clientId,
        programVersionId,
        programId: programId ?? null,
        description,
        message: message ?? null,
        structured: structured ? JSON.stringify(structured) : null,
        personalizationSnapshot: personalizationSnapshot
          ? JSON.stringify(personalizationSnapshot)
          : null,
        currentState: JSON.stringify({
          currentWeek: 1,
          workoutsCompleted: 0,
        } as PlanCurrentState),
        status: 'active',
        startDate,
        publishedAt: new Date(),
        // Add legacyClientId for backward compatibility during migration
        legacyClientId: clientId,
      };

      const result = await repos.db
        .insertInto('fitnessPlans')
        .values(planData)
        .returningAll()
        .executeTakeFirstOrThrow();

      return {
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      } as FitnessPlan;
    },

    async getCurrentInstance(clientId: string): Promise<FitnessPlan | null> {
      const result = await repos.db
        .selectFrom('fitnessPlans')
        .selectAll()
        .where('clientId', '=', clientId)
        .where('status', '=', 'active')
        .orderBy('publishedAt', 'desc')
        .limit(1)
        .executeTakeFirst();

      if (!result) {
        // Fallback to legacy query for backward compatibility
        return repos.fitnessPlan.getCurrentPlan(clientId);
      }

      return {
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      } as FitnessPlan;
    },

    async getById(id: string): Promise<FitnessPlan | null> {
      return repos.fitnessPlan.getFitnessPlan(id);
    },

    async getInstanceHistory(clientId: string): Promise<FitnessPlan[]> {
      const results = await repos.db
        .selectFrom('fitnessPlans')
        .selectAll()
        .where('clientId', '=', clientId)
        .orderBy('publishedAt', 'desc')
        .execute();

      if (results.length === 0) {
        // Fallback to legacy query for backward compatibility
        return repos.fitnessPlan.getPlanHistory(clientId);
      }

      return results.map((result) => ({
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      })) as FitnessPlan[];
    },

    async getByProgramVersionId(programVersionId: string): Promise<FitnessPlan[]> {
      const results = await repos.db
        .selectFrom('fitnessPlans')
        .selectAll()
        .where('programVersionId', '=', programVersionId)
        .orderBy('publishedAt', 'desc')
        .execute();

      return results.map((result) => ({
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      })) as FitnessPlan[];
    },

    async updateStatus(instanceId: string, status: PlanInstanceStatus): Promise<FitnessPlan | null> {
      const result = await repos.db
        .updateTable('fitnessPlans')
        .set({
          status,
          updatedAt: new Date(),
        })
        .where('id', '=', instanceId)
        .returningAll()
        .executeTakeFirst();

      if (!result) return null;

      return {
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      } as FitnessPlan;
    },

    async updateCurrentState(instanceId: string, state: PlanCurrentState): Promise<FitnessPlan | null> {
      const result = await repos.db
        .updateTable('fitnessPlans')
        .set({
          currentState: JSON.stringify(state),
          updatedAt: new Date(),
        })
        .where('id', '=', instanceId)
        .returningAll()
        .executeTakeFirst();

      if (!result) return null;

      return {
        id: result.id,
        programId: result.programId,
        programVersionId: result.programVersionId,
        clientId: result.clientId,
                publishedAt: result.publishedAt ? new Date(result.publishedAt as any) : null,
        description: result.description ?? '',
        message: result.message,
        structured: result.structured as PlanStructure | null,
        personalizationSnapshot: result.personalizationSnapshot as StructuredProfile | null,
        currentState: result.currentState as PlanCurrentState | null,
        status: result.status as PlanInstanceStatus,
        startDate: new Date(result.startDate as any),
        createdAt: new Date(result.createdAt as any),
        updatedAt: new Date(result.updatedAt as any),
      } as FitnessPlan;
    },

    async pause(instanceId: string): Promise<FitnessPlan | null> {
      return this.updateStatus(instanceId, 'paused');
    },

    async resume(instanceId: string): Promise<FitnessPlan | null> {
      return this.updateStatus(instanceId, 'active');
    },

    async complete(instanceId: string): Promise<FitnessPlan | null> {
      return this.updateStatus(instanceId, 'completed');
    },

    async abandon(instanceId: string): Promise<FitnessPlan | null> {
      return this.updateStatus(instanceId, 'abandoned');
    },

    async countActiveByVersionId(programVersionId: string): Promise<number> {
      const result = await repos.db
        .selectFrom('fitnessPlans')
        .select((eb) => eb.fn.countAll().as('count'))
        .where('programVersionId', '=', programVersionId)
        .where('status', '=', 'active')
        .executeTakeFirst();

      return Number(result?.count ?? 0);
    },
  };
}
