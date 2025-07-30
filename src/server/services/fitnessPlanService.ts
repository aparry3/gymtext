import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { FitnessPlan, FitnessPlanModel } from '../models/fitnessPlan';
import { UserWithProfile } from '../models/userModel';
import { fitnessPlanAgent } from '../agents/fitnessPlan/chain';

export class FitnessPlanService {
  constructor(
    private fitnessPlanRepo: FitnessPlanRepository,
  ) {}

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    const agentResponse = await fitnessPlanAgent.invoke({ user });

    // TODO: Save the fitness plan to the database
    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse.program);
    console.log('fitnessPlan', JSON.stringify(fitnessPlan, null, 2));
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    if (!fitnessPlan.macrocycles.length || !fitnessPlan.macrocycles[0].mesocycles.length) {
      throw new Error('Fitness plan does not have any mesocycles');
    }

    return savedFitnessPlan;
  }
}