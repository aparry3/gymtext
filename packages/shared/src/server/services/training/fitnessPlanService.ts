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
// DEPRECATED: Singleton pattern for backward compatibility
// =============================================================================

import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { createContextService } from '../context';

/**
 * @deprecated Use createFitnessPlanService(repos) instead
 */
export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private agentService: FitnessPlanAgentService | null = null;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
  }

  public static getInstance(): FitnessPlanService {
    if (!FitnessPlanService.instance) {
      FitnessPlanService.instance = new FitnessPlanService();
    }
    return FitnessPlanService.instance;
  }

  private getAgentService(): FitnessPlanAgentService {
    if (!this.agentService) {
      // Lazily create agent service using production singletons
      // Use require to avoid circular dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const services = require('@/server/services');
      const contextService = createContextService({
        fitnessPlanService: services.fitnessPlanService,
        workoutInstanceService: services.workoutInstanceService,
        microcycleService: services.microcycleService,
        fitnessProfileService: services.fitnessProfileService,
      });
      this.agentService = createFitnessPlanAgentService(contextService);
    }
    return this.agentService;
  }

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    const agentResponse = await this.getAgentService().generateFitnessPlan(user);
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
