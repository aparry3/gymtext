import { createFitnessPlanAgentService, type FitnessPlanAgentService } from '../training';
import { now, getDayOfWeek } from '@/shared/utils/date';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { UserServiceInstance } from '../../user/userService';
import type { FitnessPlanServiceInstance } from '../../training/fitnessPlanService';
import type { WorkoutModificationServiceInstance } from './workoutModificationService';
import type { ContextService } from '../../context/contextService';

export interface ModifyPlanParams {
  userId: string;
  changeRequest: string;
}

export interface ModifyPlanResult {
  success: boolean;
  wasModified?: boolean;
  modifications?: string;
  messages: string[];
  error?: string;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * PlanModificationServiceInstance interface
 */
export interface PlanModificationServiceInstance {
  modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult>;
}

export interface PlanModificationServiceDeps {
  user: UserServiceInstance;
  fitnessPlan: FitnessPlanServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  contextService: ContextService;
}

/**
 * Create a PlanModificationService instance with injected dependencies
 */
export function createPlanModificationService(
  repos: RepositoryContainer,
  deps: PlanModificationServiceDeps
): PlanModificationServiceInstance {
  const { user: userService, fitnessPlan: fitnessPlanService, workoutModification: workoutModificationService, contextService } = deps;

  let fitnessPlanAgent: FitnessPlanAgentService | null = null;

  const getFitnessPlanAgent = (): FitnessPlanAgentService => {
    if (!fitnessPlanAgent) fitnessPlanAgent = createFitnessPlanAgentService(contextService);
    return fitnessPlanAgent;
  };

  return {
    async modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult> {
      try {
        const { userId, changeRequest } = params;
        console.log('[MODIFY_PLAN] Starting plan modification', { userId, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        const currentPlan = await fitnessPlanService.getCurrentPlan(userId);
        if (!currentPlan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        const today = now(user.timezone);
        const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);

        console.log('[MODIFY_PLAN] Running plan and week modifications in parallel');

        const [planResult, weekResult] = await Promise.all([
          getFitnessPlanAgent().modifyFitnessPlan(user, currentPlan, changeRequest),
          workoutModificationService.modifyWeek({ userId, targetDay: currentDayOfWeek, changeRequest }),
        ]);

        if (!planResult.wasModified) {
          console.log('[MODIFY_PLAN] No modifications needed - current plan already satisfies the request');
          return { success: true, wasModified: false, messages: [] };
        }

        console.log('[MODIFY_PLAN] Plan was modified - saving new version');

        const newPlan = await repos.fitnessPlan.insertFitnessPlan({
          clientId: userId,
          description: planResult.description,
          structured: planResult.structure,
          startDate: new Date(),
        });

        console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);

        if (weekResult.success) {
          console.log(`[MODIFY_PLAN] Week modification completed successfully`);
        } else if (weekResult.error) {
          console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
        }

        return { success: true, wasModified: true, modifications: planResult.modifications, messages: weekResult.messages || [] };
      } catch (error) {
        console.error('[MODIFY_PLAN] Error modifying plan:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}

// =============================================================================
// DEPRECATED: Singleton pattern for backward compatibility
// Remove after all consumers migrate to factory pattern
// =============================================================================

import { UserService } from '../../user/userService';
import { FitnessPlanService } from '../../training/fitnessPlanService';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { WorkoutModificationService } from './workoutModificationService';
import { createContextService } from '../../context';

/**
 * @deprecated Use createPlanModificationService(repos, deps) instead
 */
export class PlanModificationService {
  private static instance: PlanModificationService;
  private userService: UserService;
  private fitnessPlanService: FitnessPlanService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private workoutModificationService: WorkoutModificationService;
  private _fitnessPlanAgent: FitnessPlanAgentService | null = null;

  private constructor() {
    this.userService = UserService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.workoutModificationService = WorkoutModificationService.getInstance();
  }

  public static getInstance(): PlanModificationService {
    if (!PlanModificationService.instance) {
      PlanModificationService.instance = new PlanModificationService();
    }
    return PlanModificationService.instance;
  }

  private get fitnessPlanAgentService(): FitnessPlanAgentService {
    if (!this._fitnessPlanAgent) {
      // Use require to avoid circular dependency
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const services = require('@/server/services');
      const contextService = createContextService({
        fitnessPlanService: services.fitnessPlanService,
        workoutInstanceService: services.workoutInstanceService,
        microcycleService: services.microcycleService,
        fitnessProfileService: services.fitnessProfileService,
      });
      this._fitnessPlanAgent = createFitnessPlanAgentService(contextService);
    }
    return this._fitnessPlanAgent;
  }

  /**
   * Modify a user's fitness plan based on their change request
   * Modifies (not regenerates) the current microcycle to preserve completed workouts
   * Runs plan and microcycle modifications in parallel for faster response
   */
  public async modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult> {
    try {
      const { userId, changeRequest } = params;

      console.log('[MODIFY_PLAN] Starting plan modification', { userId, changeRequest });

      // 1. Get user with profile
      const user = await this.userService.getUser(userId);
      if (!user) {
        return {
          success: false,
          messages: [],
          error: 'User not found',
        };
      }

      // 2. Get current fitness plan
      const currentPlan = await this.fitnessPlanService.getCurrentPlan(userId);
      if (!currentPlan) {
        return {
          success: false,
          messages: [],
          error: 'No fitness plan found. Please create a plan first.',
        };
      }

      // 3. Get today's date for week modification
      const today = now(user.timezone);
      const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);

      // 4. Run plan and week modifications in PARALLEL
      // modifyWeek handles microcycle modification AND workout generation
      console.log('[MODIFY_PLAN] Running plan and week modifications in parallel');

      const [planResult, weekResult] = await Promise.all([
        // Modify plan using agent service
        this.fitnessPlanAgentService.modifyFitnessPlan(user, currentPlan, changeRequest),
        // Modify week (handles microcycle + workout)
        this.workoutModificationService.modifyWeek({
          userId,
          targetDay: currentDayOfWeek,
          changeRequest,
        }),
      ]);

      // 5. Check if plan was actually modified
      if (!planResult.wasModified) {
        console.log('[MODIFY_PLAN] No modifications needed - current plan already satisfies the request');
        return {
          success: true,
          wasModified: false,
          messages: [],
        };
      }

      console.log('[MODIFY_PLAN] Plan was modified - saving new version');

      // 6. Save new plan version
      const newPlan = await this.fitnessPlanRepo.insertFitnessPlan({
        clientId: userId,
        description: planResult.description,
        structured: planResult.structure,
        startDate: new Date(),
      });

      console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);

      // Week modification (microcycle + workout) was handled in parallel by modifyWeek
      if (weekResult.success) {
        console.log(`[MODIFY_PLAN] Week modification completed successfully`);
      } else if (weekResult.error) {
        console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
      }

      return {
        success: true,
        wasModified: true,
        modifications: planResult.modifications,
        messages: weekResult.messages || [],
      };
    } catch (error) {
      console.error('[MODIFY_PLAN] Error modifying plan:', error);
      return {
        success: false,
        messages: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}

// Export singleton instance
export const planModificationService = PlanModificationService.getInstance();
