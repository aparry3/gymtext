import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { createFitnessPlanAgent } from '../../agents/training/plans';
import { createMesocycleAgent } from '../../agents/training/mesocycle';
import { FitnessProfileContext } from '../context/fitnessProfileContext';
import { postgresDb } from '@/server/connections/postgres/postgres';

export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private mesocycleRepo: MesocycleRepository;
  private contextService: FitnessProfileContext;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.mesocycleRepo = new MesocycleRepository(postgresDb);
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

    // Generate and store full mesocycle records with formatted field
    const mesocycleAgent = createMesocycleAgent({
      contextService: this.contextService
    });

    let currentWeek = 0;
    for (let i = 0; i < agentResponse.mesocycles.length; i++) {
      const mesocycleOverviewString = agentResponse.mesocycles[i];


      console.log(`[FitnessPlan] Generating mesocycle ${i + 1} of ${agentResponse.mesocycles.length}...`);

      // Generate full mesocycle with formatted field
      // The agent will return the actual durationWeeks based on microcycles generated
      const mesocycleOverview = await mesocycleAgent(
        mesocycleOverviewString,
        user
      );

      // Store mesocycle record with actual durationWeeks from agent
      await this.mesocycleRepo.createMesocycle({
        userId: user.id,
        fitnessPlanId: savedFitnessPlan.id!,
        mesocycleIndex: i,
        description: mesocycleOverview.description,
        microcycles: mesocycleOverview.microcycles,
        formatted: mesocycleOverview.formatted,
        startWeek: currentWeek,
        durationWeeks: mesocycleOverview.durationWeeks,
      });

      currentWeek += mesocycleOverview.durationWeeks;
    }

    console.log(`[FitnessPlan] Created ${agentResponse.mesocycles.length} mesocycle records`);

    return savedFitnessPlan;
  }

  /**
   * Get the current fitness plan for a user
   */
  public async getCurrentPlan(userId: string): Promise<FitnessPlan | null> {
    return await this.fitnessPlanRepo.getCurrentPlan(userId);
  }

  /**
   * Get the current fitness plan with full mesocycle records
   */
  public async getCurrentPlanWithMesocycles(userId: string) {
    const plan = await this.fitnessPlanRepo.getCurrentPlan(userId);
    if (!plan || !plan.id) {
      return null;
    }

    const mesocycles = await this.mesocycleRepo.getMesocyclesByPlanId(plan.id);

    return {
      ...plan,
      mesocycles,
    };
  }
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();