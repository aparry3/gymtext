import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { fitnessPlanAgentService } from '../agents/training';
import { postgresDb } from '@/server/connections/postgres/postgres';

/**
 * Simplified FitnessPlanService
 *
 * Creates and manages fitness plans. Plans are now simple structured text
 * that describe the training split, frequency, goals, and progression rules.
 * No more mesocycle generation - microcycles are generated directly from the plan.
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

  /**
   * Create a new fitness plan for a user
   *
   * Uses the FitnessPlanAgent to generate a structured text plan
   * that contains split, frequency, goals, deload rules, and progression principles.
   */
  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    // Use AI agent service to generate fitness plan
    const agentResponse = await fitnessPlanAgentService.generateFitnessPlan(user);

    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
    console.log('[FitnessPlanService] Created plan:', fitnessPlan.description?.substring(0, 200));

    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);

    return savedFitnessPlan;
  }

  /**
   * Get the current (latest) fitness plan for a user
   */
  public async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getCurrentPlan(userId);
  }

  /**
   * Get a fitness plan by ID
   */
  public async getPlanById(planId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getFitnessPlan(planId);
  }

  /**
   * Get all fitness plans for a user (for history)
   */
  public async getPlanHistory(userId: string): Promise<FitnessPlan[]> {
    return await this.fitnessPlanRepo.getPlanHistory(userId);
  }

  /**
   * Update a fitness plan's AI-generated fields
   */
  public async updateFitnessPlan(
    planId: string,
    updates: Partial<Pick<FitnessPlan, 'description' | 'message' | 'structured'>>
  ): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.updateFitnessPlan(planId, updates);
  }

  /**
   * Delete a fitness plan by ID
   */
  public async deleteFitnessPlan(planId: string): Promise<boolean> {
    return await this.fitnessPlanRepo.deleteFitnessPlan(planId);
  }
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();
