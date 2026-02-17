import type { UserServiceInstance } from '../../domain/user/userService';
import type { DossierServiceInstance } from '../../domain/dossier/dossierService';
import type { WorkoutModificationServiceInstance } from './workoutModificationService';
import type { SimpleAgentRunnerInstance } from '@/server/agents/runner';

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
// Factory Pattern
// =============================================================================

export interface PlanModificationServiceInstance {
  modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult>;
}

export interface PlanModificationServiceDeps {
  user: UserServiceInstance;
  dossier: DossierServiceInstance;
  workoutModification: WorkoutModificationServiceInstance;
  agentRunner: SimpleAgentRunnerInstance;
}

export function createPlanModificationService(
  deps: PlanModificationServiceDeps
): PlanModificationServiceInstance {
  const { user: userService, dossier: dossierService, workoutModification: workoutModificationService, agentRunner: simpleAgentRunner } = deps;

  return {
    async modifyPlan(params: ModifyPlanParams): Promise<ModifyPlanResult> {
      try {
        const { userId, changeRequest } = params;
        console.log('[MODIFY_PLAN] Starting plan modification', { userId, changeRequest });

        const user = await userService.getUser(userId);
        if (!user) return { success: false, messages: [], error: 'User not found' };

        // Read current plan dossier
        const currentPlan = await dossierService.getPlan(userId);
        if (!currentPlan) return { success: false, messages: [], error: 'No fitness plan found. Please create a plan first.' };

        // Build context
        const profileDossier = await dossierService.getProfile(userId);
        const context: string[] = [];
        if (profileDossier) {
          context.push(`<Profile>${profileDossier}</Profile>`);
        }
        if (currentPlan.content) {
          context.push(`<Plan>${currentPlan.content}</Plan>`);
        } else if (currentPlan.description) {
          context.push(`<Plan>${currentPlan.description}</Plan>`);
        }

        // Run plan modification + week modification in parallel
        const [planResult, weekResult] = await Promise.all([
          simpleAgentRunner.invoke('plan:modify', {
            input: changeRequest,
            context,
            params: { user },
          }),
          workoutModificationService.modifyWeek({ userId, changeRequest }),
        ]);

        const modifiedPlanContent = planResult.response;

        // Write new plan version via dossier service
        await dossierService.createPlan(userId, modifiedPlanContent, new Date());
        console.log('[MODIFY_PLAN] Saved new plan version');

        if (weekResult.success) {
          console.log('[MODIFY_PLAN] Week modification completed successfully');
        } else if (weekResult.error) {
          console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
        }

        return {
          success: true,
          wasModified: true,
          modifications: `Plan modified: ${changeRequest}`,
          messages: weekResult.messages || [],
        };
      } catch (error) {
        console.error('[MODIFY_PLAN] Error modifying plan:', error);
        return { success: false, messages: [], error: error instanceof Error ? error.message : 'Unknown error occurred' };
      }
    },
  };
}
