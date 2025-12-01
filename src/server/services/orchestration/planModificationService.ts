import { UserService } from '../user/userService';
import { FitnessPlanService } from '../training/fitnessPlanService';
import { MicrocycleService } from '../training/microcycleService';
import { ProgressService } from '../training/progressService';
import { createModifyFitnessPlanAgent } from '@/server/agents/training/plans';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { now } from '@/shared/utils/date';

/**
 * PlanModificationService
 *
 * Orchestration service for fitness plan modifications.
 *
 * Responsibilities:
 * - Modify fitness plans based on user change requests
 * - Automatically regenerate the current microcycle when plan structure changes
 * - Handle AI agent interactions for plan modifications
 * - Ensure proper sequencing and state updates
 *
 * This service follows the orchestration pattern (like WorkoutModificationService)
 * and coordinates between plan, microcycle, and progress services.
 */

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

export class PlanModificationService {
  private static instance: PlanModificationService;
  private userService: UserService;
  private fitnessPlanService: FitnessPlanService;
  private microcycleService: MicrocycleService;
  private progressService: ProgressService;
  private fitnessPlanRepo: FitnessPlanRepository;

  private constructor() {
    this.userService = UserService.getInstance();
    this.fitnessPlanService = FitnessPlanService.getInstance();
    this.microcycleService = MicrocycleService.getInstance();
    this.progressService = ProgressService.getInstance();
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
  }

  public static getInstance(): PlanModificationService {
    if (!PlanModificationService.instance) {
      PlanModificationService.instance = new PlanModificationService();
    }
    return PlanModificationService.instance;
  }

  /**
   * Modify a user's fitness plan based on their change request
   * Automatically regenerates the current microcycle if the plan was modified
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

      // 3. Call the modify plan agent
      const modifyAgent = createModifyFitnessPlanAgent();
      const modifyResult = await modifyAgent.invoke({
        user,
        currentPlan,
        changeRequest,
      });

      // 4. Check if the plan was actually modified
      if (!modifyResult.wasModified) {
        console.log('[MODIFY_PLAN] No modifications needed - current plan already satisfies the request');
        return {
          success: true,
          wasModified: false,
          messages: ['Your current plan already matches your request. No changes were needed.'],
        };
      }

      console.log('[MODIFY_PLAN] Plan was modified - saving new version');

      // 5. Save the modified plan as a new version (preserves history)
      const newPlan = await this.fitnessPlanRepo.insertFitnessPlan({
        clientId: userId,
        description: modifyResult.description,
        formatted: modifyResult.formatted,
        message: modifyResult.message,
        startDate: new Date(), // New plan starts today
      });

      console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);

      // 6. Regenerate the current microcycle with the new plan
      const today = now(user.timezone).toJSDate();
      const progress = await this.progressService.getProgressForDate(newPlan, today, user.timezone);

      if (!progress) {
        console.error('[MODIFY_PLAN] Could not calculate progress for new plan');
        return {
          success: true,
          wasModified: true,
          modifications: modifyResult.modifications,
          messages: modifyResult.message ? [modifyResult.message] : ['Your plan has been updated.'],
        };
      }

      // Create new microcycle for the current week
      const newMicrocycle = await this.microcycleService.createMicrocycleFromProgress(
        userId,
        newPlan,
        progress
      );

      console.log(`[MODIFY_PLAN] Created new microcycle ${newMicrocycle.id} for week ${progress.absoluteWeek}`);

      // 7. Build response messages
      const messages: string[] = [];
      if (modifyResult.message) {
        messages.push(modifyResult.message);
      }
      if (newMicrocycle.message) {
        messages.push(newMicrocycle.message);
      }

      return {
        success: true,
        wasModified: true,
        modifications: modifyResult.modifications,
        messages: messages.length > 0 ? messages : ['Your plan has been updated and your weekly schedule has been regenerated.'],
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
