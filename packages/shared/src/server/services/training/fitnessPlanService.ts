import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/user';
import { createFitnessPlanAgentService, type FitnessPlanAgentService } from '../agents/training';
import type { RepositoryContainer } from '../../repositories/factory';
import type { ContextService } from '../context';

/**
 * FitnessPlanServiceInstance interface
 */
export interface FitnessPlanServiceInstance {
  createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan>;
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
 * Dependencies for FitnessPlanService
 */
export interface FitnessPlanServiceDeps {
  fitnessPlanAgent?: FitnessPlanAgentService;
  contextService?: ContextService;
}

/**
 * Create a FitnessPlanService instance with injected repositories
 */
export function createFitnessPlanService(
  repos: RepositoryContainer,
  deps?: FitnessPlanServiceDeps
): FitnessPlanServiceInstance {
  // Lazily create agent service if not provided
  let agentService: FitnessPlanAgentService | null = deps?.fitnessPlanAgent ?? null;

  const getAgentService = (): FitnessPlanAgentService => {
    if (!agentService) {
      if (!deps?.contextService) {
        throw new Error('FitnessPlanService requires either fitnessPlanAgent or contextService to be provided');
      }
      agentService = createFitnessPlanAgentService(deps.contextService);
    }
    return agentService;
  };

  return {
    async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
      const agentResponse = await getAgentService().generateFitnessPlan(user);
      const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
      console.log('[FitnessPlanService] Created plan:', fitnessPlan.description?.substring(0, 200));
      const savedFitnessPlan = await repos.fitnessPlan.insertFitnessPlan(fitnessPlan);
      return savedFitnessPlan;
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
