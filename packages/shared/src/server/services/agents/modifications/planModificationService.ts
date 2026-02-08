import { now, getDayOfWeek } from '@/shared/utils/date';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { UserServiceInstance } from '../../domain/user/userService';
import type { FitnessPlanServiceInstance } from '../../domain/training/fitnessPlanService';
import type { WorkoutModificationServiceInstance } from './workoutModificationService';
import type { AgentRunnerInstance } from '@/server/agents/runner';
import type { PlanStructure } from '@/server/models/fitnessPlan';

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
  agentRunner: AgentRunnerInstance;
}

/**
 * Create a PlanModificationService instance with injected dependencies
 *
 * Uses AgentRunner to invoke plan:modify agent declaratively.
 * Context, schema, and sub-agents (plan:structured) are resolved from DB config.
 */
export function createPlanModificationService(
  repos: RepositoryContainer,
  deps: PlanModificationServiceDeps
): PlanModificationServiceInstance {
  const { user: userService, fitnessPlan: fitnessPlanService, workoutModification: workoutModificationService, agentRunner } = deps;

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
          // Invoke plan:modify via AgentRunner
          // Context (programVersion, user, userProfile, fitnessPlan), schema, and sub-agents (plan:structured)
          // are all resolved from DB config
          agentRunner.invoke('plan:modify', {
            user,
            message: changeRequest,
            extras: { planText: currentPlan.description || '' },
          }),
          workoutModificationService.modifyWeek({ userId, targetDay: currentDayOfWeek, changeRequest }),
        ]);

        // Extract typed result from agent output
        const agentResponse = planResult.response as { description: string; wasModified: boolean; modifications: string };
        const structure = (planResult as Record<string, unknown>).structure as PlanStructure | undefined;

        if (!agentResponse.wasModified) {
          console.log('[MODIFY_PLAN] No modifications needed - current plan already satisfies the request');
          return { success: true, wasModified: false, messages: [] };
        }

        console.log('[MODIFY_PLAN] Plan was modified - saving new version');

        const newPlan = await repos.fitnessPlan.insertFitnessPlan({
          clientId: userId,
          description: agentResponse.description,
          structured: structure,
          startDate: new Date(),
        });

        console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);

        if (weekResult.success) {
          console.log(`[MODIFY_PLAN] Week modification completed successfully`);
        } else if (weekResult.error) {
          console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
        }

        return { success: true, wasModified: true, modifications: agentResponse.modifications, messages: weekResult.messages || [] };
      } catch (error) {
        console.error('[MODIFY_PLAN] Error modifying plan:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
