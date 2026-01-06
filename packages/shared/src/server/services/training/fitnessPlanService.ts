import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/user';
import { fitnessPlanAgentService } from '../agents/training';
import type { RepositoryContainer } from '../../repositories/factory';

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
 * Create a FitnessPlanService instance with injected repositories
 */
export function createFitnessPlanService(repos: RepositoryContainer): FitnessPlanServiceInstance {
  return {
    async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
      const agentResponse = await fitnessPlanAgentService.generateFitnessPlan(user);
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
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';

/**
 * @deprecated Use createFitnessPlanService(repos) instead
 */
export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
  }

  public static getInstance(): FitnessPlanService {
    if (!FitnessPlanService.instance) {
      FitnessPlanService.instance = new FitnessPlanService();
    }
    return FitnessPlanService.instance;
  }

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    const agentResponse = await fitnessPlanAgentService.generateFitnessPlan(user);
    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
    console.log('[FitnessPlanService] Created plan:', fitnessPlan.description?.substring(0, 200));
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    return savedFitnessPlan;
  }

  public async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getCurrentPlan(userId);
  }

  public async getPlanById(planId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getFitnessPlan(planId);
  }

  public async getPlanHistory(userId: string): Promise<FitnessPlan[]> {
    return await this.fitnessPlanRepo.getPlanHistory(userId);
  }

  public async updateFitnessPlan(
    planId: string,
    updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>
  ): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.updateFitnessPlan(planId, updates);
  }

  public async deleteFitnessPlan(planId: string): Promise<boolean> {
    return await this.fitnessPlanRepo.deleteFitnessPlan(planId);
  }
}

/**
 * @deprecated Use createFitnessPlanService(repos) instead
 */
export const fitnessPlanService = FitnessPlanService.getInstance();
