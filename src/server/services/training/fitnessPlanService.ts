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

      // Estimate duration weeks (default to 4 if not specified)
      // TODO: Extract actual duration from mesocycle overview
      const durationWeeks = 4;

      console.log(`[FitnessPlan] Generating mesocycle ${i + 1} of ${agentResponse.mesocycles.length}...`);

      // Generate full mesocycle with formatted field
      const mesocycleOverview = await mesocycleAgent(
        mesocycleOverviewString,
        durationWeeks,
        user
      );

      // Store mesocycle record
      await this.mesocycleRepo.createMesocycle({
        userId: user.id,
        fitnessPlanId: savedFitnessPlan.id!,
        mesocycleIndex: i,
        description: mesocycleOverview.description,
        microcycles: mesocycleOverview.microcycles,
        formatted: mesocycleOverview.formatted,
        startWeek: currentWeek,
        durationWeeks: durationWeeks,
      });

      currentWeek += durationWeeks;
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
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();