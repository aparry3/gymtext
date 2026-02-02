import { createFitnessPlanAgentService, type FitnessPlanAgentService } from '../training';
import { now, getDayOfWeek } from '@/shared/utils/date';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { FitnessPlanServiceInstance } from '../../domain/training/fitnessPlanService';
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

