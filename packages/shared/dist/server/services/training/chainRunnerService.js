import { FitnessPlanService } from '@/server/services/training/fitnessPlanService';
import { MicrocycleService } from '@/server/services/training/microcycleService';
import { WorkoutInstanceService } from '@/server/services/training/workoutInstanceService';
import { UserService } from '@/server/services/user/userService';
import { FitnessProfileService } from '@/server/services/user/fitnessProfileService';
import { OnboardingRepository } from '@/server/repositories/onboardingRepository';
// Agent services for full chain operations and sub-agents
import { workoutAgentService, microcycleAgentService, fitnessPlanAgentService, } from '@/server/services/agents/training';
/**
 * Chain Runner Service
 *
 * Enables running individual chain components (structured, formatted, message)
 * or full chains for fitness plans, microcycles, and workouts.
 *
 * Used for testing and iterative improvement of AI outputs.
 */
export class ChainRunnerService {
    static instance;
    fitnessPlanService;
    microcycleService;
    workoutService;
    userService;
    fitnessProfileService;
    onboardingRepository;
    constructor() {
        this.fitnessPlanService = FitnessPlanService.getInstance();
        this.microcycleService = MicrocycleService.getInstance();
        this.workoutService = WorkoutInstanceService.getInstance();
        this.userService = UserService.getInstance();
        this.fitnessProfileService = FitnessProfileService.getInstance();
        this.onboardingRepository = new OnboardingRepository();
    }
    static getInstance() {
        if (!ChainRunnerService.instance) {
            ChainRunnerService.instance = new ChainRunnerService();
        }
        return ChainRunnerService.instance;
    }
    // ============================================
    // PROFILE OPERATIONS
    // ============================================
    /**
     * Regenerate a user's profile from their signup data
     * Creates a new profile from scratch using the ProfileUpdateAgent
     */
    async runProfileRegeneration(userId) {
        const startTime = Date.now();
        console.log(`[ChainRunner] Regenerating profile for user ${userId}`);
        // Fetch the user with profile
        const user = await this.userService.getUser(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        // Fetch signup data
        const signupData = await this.onboardingRepository.getSignupData(userId);
        if (!signupData) {
            throw new Error(`No signup data found for user: ${userId}`);
        }
        // Regenerate profile from signup data
        const profile = await this.fitnessProfileService.createFitnessProfile(user, signupData);
        if (!profile) {
            throw new Error(`Failed to regenerate profile for user: ${userId}`);
        }
        console.log(`[ChainRunner] Profile regenerated for user ${userId}`);
        return {
            success: true,
            profile,
            executionTimeMs: Date.now() - startTime,
        };
    }
    // ============================================
    // FITNESS PLAN OPERATIONS
    // ============================================
    /**
     * Run a chain operation for a fitness plan
     */
    async runFitnessPlanChain(planId, operation) {
        const startTime = Date.now();
        // Fetch the plan
        const plan = await this.fitnessPlanService.getPlanById(planId);
        if (!plan) {
            throw new Error(`Fitness plan not found: ${planId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(plan.clientId);
        if (!user) {
            throw new Error(`User not found: ${plan.clientId}`);
        }
        let updatedPlan;
        switch (operation) {
            case 'full':
                updatedPlan = await this.runFullFitnessPlanChain(plan, user);
                break;
            case 'structured':
                updatedPlan = await this.runFitnessPlanStructuredChain(plan);
                break;
            case 'message':
                updatedPlan = await this.runFitnessPlanMessageChain(plan, user);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedPlan,
            executionTimeMs: Date.now() - startTime,
            operation,
        };
    }
    async runFullFitnessPlanChain(plan, user) {
        console.log(`[ChainRunner] Running full fitness plan chain for plan ${plan.id}`);
        // Use fitness plan agent service for full chain
        const result = await fitnessPlanAgentService.generateFitnessPlan(user);
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            description: result.description,
            message: result.message,
            structured: result.structure,
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    async runFitnessPlanStructuredChain(plan) {
        console.log(`[ChainRunner] Running structured chain for plan ${plan.id}`);
        const agent = await fitnessPlanAgentService.getStructuredAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            description: plan.description || '',
        });
        const result = await agent.invoke(inputJson);
        const structure = result.response;
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            structured: structure,
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    async runFitnessPlanMessageChain(plan, user) {
        console.log(`[ChainRunner] Running message chain for plan ${plan.id}`);
        const agent = await fitnessPlanAgentService.getMessageAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            description: plan.description || '',
            user,
        });
        const result = await agent.invoke(inputJson);
        const message = result.response;
        const updated = await this.fitnessPlanService.updateFitnessPlan(plan.id, {
            message,
        });
        if (!updated) {
            throw new Error(`Failed to update fitness plan: ${plan.id}`);
        }
        return updated;
    }
    // ============================================
    // MICROCYCLE OPERATIONS
    // ============================================
    /**
     * Run a chain operation for a microcycle
     */
    async runMicrocycleChain(microcycleId, operation) {
        const startTime = Date.now();
        // Fetch the microcycle
        const microcycle = await this.microcycleService.getMicrocycleById(microcycleId);
        if (!microcycle) {
            throw new Error(`Microcycle not found: ${microcycleId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(microcycle.clientId);
        if (!user) {
            throw new Error(`User not found: ${microcycle.clientId}`);
        }
        // Fetch the user's current plan for full regeneration
        const plan = await this.fitnessPlanService.getCurrentPlan(microcycle.clientId);
        if (!plan) {
            throw new Error(`No active fitness plan found for client: ${microcycle.clientId}`);
        }
        let updatedMicrocycle;
        switch (operation) {
            case 'full':
                updatedMicrocycle = await this.runFullMicrocycleChain(microcycle, plan, user);
                break;
            case 'structured':
                updatedMicrocycle = await this.runMicrocycleStructuredChain(microcycle);
                break;
            case 'message':
                updatedMicrocycle = await this.runMicrocycleMessageChain(microcycle);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedMicrocycle,
            executionTimeMs: Date.now() - startTime,
            operation,
        };
    }
    async runFullMicrocycleChain(microcycle, plan, user) {
        console.log(`[ChainRunner] Running full microcycle chain for microcycle ${microcycle.id}`);
        // Use microcycle agent service for full chain
        // Fitness plan is auto-fetched by context service
        // isDeload is determined by agent from plan's Progression Strategy
        const result = await microcycleAgentService.generateMicrocycle(user, microcycle.absoluteWeek);
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            days: result.days,
            description: result.description,
            isDeload: result.isDeload,
            message: result.message,
            structured: result.structure,
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    async runMicrocycleStructuredChain(microcycle) {
        console.log(`[ChainRunner] Running structured chain for microcycle ${microcycle.id}`);
        const agent = await microcycleAgentService.getStructuredAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            overview: microcycle.description || '',
            days: microcycle.days,
            absoluteWeek: microcycle.absoluteWeek,
            isDeload: microcycle.isDeload,
        });
        const result = await agent.invoke(inputJson);
        const structure = result.response;
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            structured: structure,
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    async runMicrocycleMessageChain(microcycle) {
        console.log(`[ChainRunner] Running message chain for microcycle ${microcycle.id}`);
        const agent = await microcycleAgentService.getMessageAgent();
        // Configurable agents expect JSON string input
        const inputJson = JSON.stringify({
            overview: microcycle.description || '',
            days: microcycle.days,
            isDeload: microcycle.isDeload,
        });
        const result = await agent.invoke(inputJson);
        const message = result.response;
        const updated = await this.microcycleService.updateMicrocycle(microcycle.id, {
            message,
        });
        if (!updated) {
            throw new Error(`Failed to update microcycle: ${microcycle.id}`);
        }
        return updated;
    }
    // ============================================
    // WORKOUT OPERATIONS
    // ============================================
    /**
     * Run a chain operation for a workout
     */
    async runWorkoutChain(workoutId, operation) {
        const startTime = Date.now();
        // Fetch the workout
        const workout = await this.workoutService.getWorkoutByIdInternal(workoutId);
        if (!workout) {
            throw new Error(`Workout not found: ${workoutId}`);
        }
        // Fetch the user with profile
        const user = await this.userService.getUser(workout.clientId);
        if (!user) {
            throw new Error(`User not found: ${workout.clientId}`);
        }
        // Fetch microcycle for full regeneration
        let microcycle = null;
        if (workout.microcycleId) {
            microcycle = await this.microcycleService.getMicrocycleById(workout.microcycleId);
        }
        let updatedWorkout;
        switch (operation) {
            case 'full':
                updatedWorkout = await this.runFullWorkoutChain(workout, user, microcycle);
                break;
            case 'structured':
                updatedWorkout = await this.runWorkoutStructuredChain(workout);
                break;
            case 'message':
                updatedWorkout = await this.runWorkoutMessageChain(workout);
                break;
            default:
                throw new Error(`Unknown operation: ${operation}`);
        }
        return {
            success: true,
            data: updatedWorkout,
            executionTimeMs: Date.now() - startTime,
            operation,
        };
    }
    async runFullWorkoutChain(workout, user, microcycle) {
        console.log(`[ChainRunner] Running full workout chain for workout ${workout.id}`);
        // Determine day overview and activity type from microcycle
        let dayOverview = workout.goal || 'General workout';
        let activityType;
        if (microcycle) {
            const workoutDate = new Date(workout.date);
            const dayOfWeek = workoutDate.getDay(); // 0 = Sunday
            // Convert to microcycle days array index (0 = Monday)
            const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            if (microcycle.days[dayIndex]) {
                dayOverview = microcycle.days[dayIndex];
            }
            // Get activity type from structured data
            const structuredDay = microcycle.structured?.days?.[dayIndex];
            activityType = structuredDay?.activityType;
        }
        // Use workout agent service for full chain
        const result = await workoutAgentService.generateWorkout(user, dayOverview, microcycle?.isDeload || false, activityType);
        const updated = await this.workoutService.updateWorkout(workout.id, {
            description: result.response,
            message: result.message,
            structured: result.structure,
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
    }
    async runWorkoutStructuredChain(workout) {
        console.log(`[ChainRunner] Running structured chain for workout ${workout.id}`);
        if (!workout.description) {
            throw new Error(`Workout ${workout.id} has no description to parse`);
        }
        const agent = await workoutAgentService.getStructuredAgent();
        const result = await agent.invoke(workout.description);
        const structure = result.response;
        const updated = await this.workoutService.updateWorkout(workout.id, {
            structured: structure,
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
    }
    async runWorkoutMessageChain(workout) {
        console.log(`[ChainRunner] Running message chain for workout ${workout.id}`);
        if (!workout.description) {
            throw new Error(`Workout ${workout.id} has no description to create message from`);
        }
        const agent = await workoutAgentService.getMessageAgent();
        const result = await agent.invoke(workout.description);
        const message = result.response;
        const updated = await this.workoutService.updateWorkout(workout.id, {
            message,
        });
        if (!updated) {
            throw new Error(`Failed to update workout: ${workout.id}`);
        }
        return updated;
    }
}
