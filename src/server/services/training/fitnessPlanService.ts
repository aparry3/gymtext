import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { createFitnessPlanAgent } from '../../agents/training/plans';
import { FitnessProfileContext } from '../context/fitnessProfileContext';
import { postgresDb } from '@/server/connections/postgres/postgres';

export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private contextService: FitnessProfileContext;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.contextService = new FitnessProfileContext();
  }

  public static getInstance(): FitnessPlanService {
    if (!FitnessPlanService.instance) {
      FitnessPlanService.instance = new FitnessPlanService();
    }
    return FitnessPlanService.instance;
  }

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    // Create agent with injected context service (DI pattern)
    const fitnessPlanAgent = createFitnessPlanAgent({
      contextService: this.contextService
    });

    const agentResponse = await fitnessPlanAgent(user);

    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
    console.log('fitnessPlan', JSON.stringify(fitnessPlan, null, 2));
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    if (!fitnessPlan.mesocycles || fitnessPlan.mesocycles.length === 0) {
      throw new Error('Fitness plan does not have any mesocycles');
    }

    return savedFitnessPlan;
  }

  /**
   * Get the current fitness plan for a user
   */
  public async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getCurrentPlan(userId);
  }
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();