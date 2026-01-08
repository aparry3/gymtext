import { FitnessPlan } from '../../../models/fitnessPlan';
import type { RepositoryContainer } from '../../../repositories/factory';

/**
 * FitnessPlanServiceInstance interface
 *
 * Pure CRUD operations for fitness plans.
 * For plan generation/orchestration, use TrainingService.createFitnessPlan().
 */
export interface FitnessPlanServiceInstance {
  insertPlan(plan: FitnessPlan): Promise<FitnessPlan>;
  getCurrentPlan(userId: string): Promise<FitnessPlan | null>;
  getPlanById(planId: string): Promise<FitnessPlan | null>;
  getPlanHistory(userId: string): Promise<FitnessPlan[]>;
  updateFitnessPlan(
    planId: string,
    updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>
  ): Promise<FitnessPlan | null>;
  deleteFitnessPlan(planId: string): Promise<boolean>;
}

/**
 * Create a FitnessPlanService instance with injected repositories
 *
 * This is a pure CRUD service - no orchestration logic.
 * For generating fitness plans, use TrainingService.createFitnessPlan().
 */
export function createFitnessPlanService(
  repos: RepositoryContainer
): FitnessPlanServiceInstance {
  return {
    async insertPlan(plan: FitnessPlan): Promise<FitnessPlan> {
      console.log('[FitnessPlanService] Inserting plan:', plan.description?.substring(0, 200));
      return await repos.fitnessPlan.insertFitnessPlan(plan);
    },

    async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
      return await repos.fitnessPlan.getCurrentPlan(userId);
    },

    async getPlanById(planId: string): Promise<FitnessPlan | null> {
      return await repos.fitnessPlan.getFitnessPlan(planId);
    },

    async getPlanHistory(userId: string): Promise<FitnessPlan[]> {
      return await repos.fitnessPlan.getPlanHistory(userId);
    },

    async updateFitnessPlan(
      planId: string,
      updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>
    ): Promise<FitnessPlan | null> {
      return await repos.fitnessPlan.updateFitnessPlan(planId, updates);
    },

    async deleteFitnessPlan(planId: string): Promise<boolean> {
      return await repos.fitnessPlan.deleteFitnessPlan(planId);
    },
  };
}

// =============================================================================
