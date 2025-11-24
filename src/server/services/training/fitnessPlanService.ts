import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MesocycleRepository } from '@/server/repositories/mesocycleRepository';
import { FitnessPlan, FitnessPlanModel } from '../../models/fitnessPlan';
import { UserWithProfile } from '../../models/userModel';
import { createFitnessPlanAgent } from '../../agents/training/plans';
import { createMesocycleAgent } from '../../agents/training/mesocycle';
import { createModifyFitnessPlanAgent } from '../../agents/training/plans/operations';
import { postgresDb } from '@/server/connections/postgres/postgres';

export class FitnessPlanService {
  private static instance: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private mesocycleRepo: MesocycleRepository;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.mesocycleRepo = new MesocycleRepository(postgresDb);
  }

  public static getInstance(): FitnessPlanService {
    if (!FitnessPlanService.instance) {
      FitnessPlanService.instance = new FitnessPlanService();
    }
    return FitnessPlanService.instance;
  }

  public async createFitnessPlan(user: UserWithProfile): Promise<FitnessPlan> {
    // Create agent with injected context service (DI pattern)
    const fitnessPlanAgent = createFitnessPlanAgent();

    const agentResponse = await fitnessPlanAgent(user);

    const fitnessPlan = FitnessPlanModel.fromFitnessPlanOverview(user, agentResponse);
    console.log('fitnessPlan', JSON.stringify(fitnessPlan, null, 2));
    const savedFitnessPlan = await this.fitnessPlanRepo.insertFitnessPlan(fitnessPlan);
    if (!fitnessPlan.mesocycles || fitnessPlan.mesocycles.length === 0) {
      throw new Error('Fitness plan does not have any mesocycles');
    }

    // Generate and store full mesocycle records with formatted field
    const mesocycleAgent = createMesocycleAgent();

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

  /**
   * Modify an existing fitness plan based on user change request
   *
   * @param userId - User ID
   * @param changeRequest - Natural language change request (e.g., "Can I train 6 days instead of 4?")
   * @returns Modified fitness plan with wasModified flag and modifications explanation
   */
  public async modifyFitnessPlan(userId: string, changeRequest: string): Promise<{
    success: boolean;
    plan?: FitnessPlan;
    wasModified: boolean;
    modifications: string;
    message?: string;
    error?: string;
  }> {
    try {
      // Get the current plan
      const currentPlan = await this.fitnessPlanRepo.getCurrentPlan(userId);
      if (!currentPlan || !currentPlan.id) {
        return {
          success: false,
          wasModified: false,
          modifications: '',
          error: 'No fitness plan found for user',
        };
      }

      // Get user with profile
      const { UserService } = await import('../user/userService');
      const userService = UserService.getInstance();
      const user = await userService.getUser(userId);
      if (!user) {
        return {
          success: false,
          wasModified: false,
          modifications: '',
          error: 'User not found',
        };
      }

      // Create and invoke the modification agent
      const modifyFitnessPlanAgent = createModifyFitnessPlanAgent({
        config: {
          model: 'gpt-5-mini',
        }
      });

      const result = await modifyFitnessPlanAgent.invoke({
        user,
        currentPlan,
        changeRequest,
      });

      // If the plan was not modified, return early
      if (!result.wasModified) {
        console.log('[FitnessPlanService] No modifications needed - current plan already satisfies request');
        return {
          success: true,
          plan: currentPlan,
          wasModified: false,
          modifications: '',
          message: 'Your current plan already matches your request. No changes were needed.',
        };
      }

      // Update the plan in the database
      const updatedPlan: FitnessPlan = {
        ...currentPlan,
        description: result.description,
        mesocycles: result.mesocycles,
        lengthWeeks: result.totalWeeks,
        formatted: result.formatted,
        message: result.message,
      };

      await this.fitnessPlanRepo.updateFitnessPlan(currentPlan.id, {
        description: result.description,
        mesocycles: result.mesocycles,
        lengthWeeks: result.totalWeeks,
        formatted: result.formatted,
        message: result.message,
      });

      console.log(`[FitnessPlanService] Successfully modified fitness plan ${currentPlan.id}`);
      console.log(`[FitnessPlanService] Modifications: ${result.modifications}`);

      // TODO: Consider regenerating mesocycles if structural changes warrant it
      // This would involve checking if frequency or split changed significantly
      // and then regenerating the mesocycle records from the updated mesocycle strings

      return {
        success: true,
        plan: updatedPlan,
        wasModified: true,
        modifications: result.modifications,
        message: result.message,
      };
    } catch (error) {
      console.error('[FitnessPlanService] Error modifying fitness plan:', error);
      return {
        success: false,
        wasModified: false,
        modifications: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const fitnessPlanService = FitnessPlanService.getInstance();