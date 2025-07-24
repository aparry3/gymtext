import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { FitnessPlan, FitnessPlanModel, FitnessPlanOverview } from '../models/fitnessPlan';
import { UserWithProfile } from '../models/userModel';
import { FitnessProfileContext } from './context/fitnessProfileContext';
import { fitnessPlanAgent } from '../agents/fitnessPlan/chain';
import { welcomeMessageAgent } from '../agents/welcomeMessage/chain';

export class FitnessPlanService {
  constructor(
    private fitnessPlanRepo: FitnessPlanRepository,
  ) {}

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    const fitnessProfileContextService = new FitnessProfileContext(user);
    const fitnessProfile = await fitnessProfileContextService.getContext();
    const agentResponse = await fitnessPlanAgent.invoke({ user });

    // TODO: Save the fitness plan to the database
    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse.program);
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    if (!fitnessPlan.macrocycles.length || !fitnessPlan.macrocycles[0].mesocycles.length) {
      throw new Error('Fitness plan does not have any mesocycles');
    }

    return savedFitnessPlan;
  }
}