import { UserService } from '../../user/userService';
import { FitnessPlanService } from '../../training/fitnessPlanService';
import { MicrocycleService } from '../../training/microcycleService';
import { ProgressService } from '../../training/progressService';
import { createModifyFitnessPlanAgent } from '@/server/agents/training/plans';
import { createModifyMicrocycleAgent } from '@/server/agents/training/microcycles';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { now, getDayOfWeek } from '@/shared/utils/date';

/**
 * PlanModificationService
 *
 * Orchestration service for fitness plan modifications.
 *
 * Responsibilities:
 * - Modify fitness plans based on user change requests
 * - Modify (not regenerate) the current microcycle to preserve completed workouts
 * - Handle AI agent interactions for plan modifications
 * - Run plan and microcycle modifications in parallel for faster response
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

      // 3. Get existing microcycle BEFORE modifications (needed for parallel execution)
      // Note: queries by clientId only, not fitnessPlanId, to handle plan modifications
      const today = now(user.timezone);
      const existingMicrocycle = await this.microcycleService.getMicrocycleByDate(
        userId,
        today.toJSDate()
      );

      // 4. Run plan and microcycle modifications in PARALLEL
      const modifyPlanAgent = createModifyFitnessPlanAgent();
      const modifyMicrocycleAgent = createModifyMicrocycleAgent();
      const currentDayOfWeek = getDayOfWeek(today.toJSDate(), user.timezone);

      console.log('[MODIFY_PLAN] Running plan and microcycle modifications in parallel');

      const [planResult, microcycleResult] = await Promise.all([
        // Modify plan
        modifyPlanAgent.invoke({
          user,
          currentPlan,
          changeRequest,
        }),
        // Modify microcycle (only if exists)
        existingMicrocycle
          ? modifyMicrocycleAgent.invoke({
              user,
              currentMicrocycle: existingMicrocycle,
              changeRequest, // Use original user request
              currentDayOfWeek,
              weekNumber: existingMicrocycle.absoluteWeek,
            })
          : Promise.resolve(null),
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
        formatted: planResult.formatted,
        startDate: new Date(),
      });

      console.log(`[MODIFY_PLAN] Saved new plan version ${newPlan.id}`);

      // 7. Update or create microcycle
      if (microcycleResult && existingMicrocycle) {
        // Update existing microcycle with modified data + link to new plan
        await this.microcycleService.updateMicrocycle(existingMicrocycle.id!, {
          fitnessPlanId: newPlan.id!,
          days: microcycleResult.days,
          description: microcycleResult.description,
          formatted: microcycleResult.formatted,
          isDeload: microcycleResult.isDeload,
        });
        console.log(`[MODIFY_PLAN] Updated existing microcycle ${existingMicrocycle.id} and linked to new plan`);
      } else {
        // No existing microcycle - create new one
        const progress = await this.progressService.getProgressForDate(newPlan, today.toJSDate(), user.timezone);
        if (progress) {
          const newMicrocycle = await this.microcycleService.createMicrocycleFromProgress(userId, newPlan, progress);
          console.log(`[MODIFY_PLAN] Created new microcycle ${newMicrocycle.id} for week ${progress.absoluteWeek}`);
        }
      }

      return {
        success: true,
        wasModified: true,
        modifications: planResult.modifications,
        messages: [],
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
