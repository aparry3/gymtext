import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { FitnessPlan, FitnessPlanModel } from '../models/fitnessPlan';
import { UserWithProfile } from '../models/userModel';
import { generateFitnessPlan } from '../agents/fitnessPlan/chain';

export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository();
  }

  public static getInstance(): FitnessPlanService {
    if (!FitnessPlanService.instance) {
      FitnessPlanService.instance = new FitnessPlanService();
    }
    return FitnessPlanService.instance;
  }

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    const agentResponse = await generateFitnessPlan(user);

    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
    console.log('fitnessPlan', JSON.stringify(fitnessPlan, null, 2));
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    if (!fitnessPlan.mesocycles || fitnessPlan.mesocycles.length === 0) {
      throw new Error('Fitness plan does not have any mesocycles');
    }

    return savedFitnessPlan;
  }
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();