import { UserService } from '../../user/userService';
import { FitnessPlanService } from '../../training/fitnessPlanService';
import { fitnessPlanAgentService } from '../training';
import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { postgresDb } from '@/server/connections/postgres/postgres';
import { now, getDayOfWeek } from '@/shared/utils/date';
import { WorkoutModificationService } from './workoutModificationService';
export class PlanModificationService {
    static instance;
    userService;
    fitnessPlanService;
    fitnessPlanRepo;
    workoutModificationService;
    constructor() {
        this.userService = UserService.getInstance();
        this.fitnessPlanService = FitnessPlanService.getInstance();
        this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
        this.workoutModificationService = WorkoutModificationService.getInstance();
    }
    static getInstance() {
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
    async modifyPlan(params) {
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
                fitnessPlanAgentService.modifyFitnessPlan(user, currentPlan, changeRequest),
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
            }
            else if (weekResult.error) {
                console.warn(`[MODIFY_PLAN] Week modification had issues: ${weekResult.error}`);
            }
            return {
                success: true,
                wasModified: true,
                modifications: planResult.modifications,
                messages: weekResult.messages || [],
            };
        }
        catch (error) {
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
