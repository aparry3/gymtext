// Agent services for full chain operations and sub-agents
import {
  createWorkoutAgentService,
  createMicrocycleAgentService,
  createFitnessPlanAgentService,
  type WorkoutAgentService,
  type MicrocycleAgentService,
  type FitnessPlanAgentService,
} from '@/server/services/agents/training';

// Types
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { FitnessPlanServiceInstance } from './fitnessPlanService';
import type { MicrocycleServiceInstance } from './microcycleService';
import type { WorkoutInstanceServiceInstance } from './workoutInstanceService';
import type { UserServiceInstance } from '../user/userService';
import type { FitnessProfileServiceInstance } from '../user/fitnessProfileService';
import type { ContextService } from '../../context/contextService';

// Exercise resolution
import { resolveExercisesInStructure } from '../../orchestration/trainingService';
import type { ExerciseResolutionServiceInstance } from '../exercise/exerciseResolutionService';
import type { ExerciseUseRepository } from '@/server/repositories/exerciseUseRepository';

export type ChainOperation = 'full' | 'structured' | 'message';

export interface ChainRunResult<T> {
  success: boolean;
  data: T;
  executionTimeMs: number;
  operation: ChainOperation;
}

export interface ProfileRegenerationResult {
  success: boolean;
  profile: string;
  executionTimeMs: number;
}

// =============================================================================
// Factory Pattern (Recommended)
// =============================================================================

/**
 * ChainRunnerServiceInstance interface
 */
export interface ChainRunnerServiceInstance {
  runProfileRegeneration(userId: string): Promise<ProfileRegenerationResult>;
  runFitnessPlanChain(planId: string, operation: ChainOperation): Promise<ChainRunResult<FitnessPlan>>;
  runMicrocycleChain(microcycleId: string, operation: ChainOperation): Promise<ChainRunResult<Microcycle>>;
  runWorkoutChain(workoutId: string, operation: ChainOperation): Promise<ChainRunResult<WorkoutInstance>>;
}

export interface ChainRunnerServiceDeps {
  fitnessPlan: FitnessPlanServiceInstance;
  microcycle: MicrocycleServiceInstance;
  workoutInstance: WorkoutInstanceServiceInstance;
  user: UserServiceInstance;
  fitnessProfile: FitnessProfileServiceInstance;
  contextService: ContextService;
  exerciseResolution?: ExerciseResolutionServiceInstance;
  exerciseUse?: ExerciseUseRepository;
}

/**
 * Create a ChainRunnerService instance with injected dependencies
 */
export function createChainRunnerService(
  repos: RepositoryContainer,
  deps: ChainRunnerServiceDeps
): ChainRunnerServiceInstance {
  const { fitnessPlan: fitnessPlanService, microcycle: microcycleService, workoutInstance: workoutService, user: userService, fitnessProfile: fitnessProfileService, contextService, exerciseResolution, exerciseUse } = deps;

  let workoutAgent: WorkoutAgentService | null = null;
  let microcycleAgent: MicrocycleAgentService | null = null;
  let fitnessPlanAgent: FitnessPlanAgentService | null = null;

  const getWorkoutAgent = (): WorkoutAgentService => {
    if (!workoutAgent) workoutAgent = createWorkoutAgentService(contextService);
    return workoutAgent;
  };

  const getMicrocycleAgent = (): MicrocycleAgentService => {
    if (!microcycleAgent) microcycleAgent = createMicrocycleAgentService(contextService);
    return microcycleAgent;
  };

  const getFitnessPlanAgent = (): FitnessPlanAgentService => {
    if (!fitnessPlanAgent) fitnessPlanAgent = createFitnessPlanAgentService(contextService);
    return fitnessPlanAgent;
  };

  // Helper functions for chain operations
  const runFullFitnessPlanChain = async (plan: FitnessPlan, user: UserWithProfile): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running full fitness plan chain for plan ${plan.id}`);
    const result = await getFitnessPlanAgent().generateFitnessPlan(user);
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { description: result.description, message: result.message, structured: result.structure });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFitnessPlanStructuredChain = async (plan: FitnessPlan): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running structured chain for plan ${plan.id}`);
    const agent = await getFitnessPlanAgent().getStructuredAgent();
    const inputJson = JSON.stringify({ description: plan.description || '' });
    const result = await agent.invoke(inputJson);
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { structured: result.response });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFitnessPlanMessageChain = async (plan: FitnessPlan, user: UserWithProfile): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running message chain for plan ${plan.id}`);
    const agent = await getFitnessPlanAgent().getMessageAgent();
    const inputJson = JSON.stringify({ description: plan.description || '', user });
    const result = await agent.invoke(inputJson);
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { message: result.response });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFullMicrocycleChain = async (microcycle: Microcycle, _plan: FitnessPlan, user: UserWithProfile): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running full microcycle chain for microcycle ${microcycle.id}`);
    const result = await getMicrocycleAgent().generateMicrocycle(user, microcycle.absoluteWeek);
    const updated = await microcycleService.updateMicrocycle(microcycle.id, { days: result.days, description: result.description, isDeload: result.isDeload, message: result.message, structured: result.structure });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runMicrocycleStructuredChain = async (microcycle: Microcycle): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running structured chain for microcycle ${microcycle.id}`);
    const agent = await getMicrocycleAgent().getStructuredAgent();
    const inputJson = JSON.stringify({ overview: microcycle.description || '', days: microcycle.days, absoluteWeek: microcycle.absoluteWeek, isDeload: microcycle.isDeload });
    const result = await agent.invoke(inputJson);
    const updated = await microcycleService.updateMicrocycle(microcycle.id, { structured: result.response });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runMicrocycleMessageChain = async (microcycle: Microcycle): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running message chain for microcycle ${microcycle.id}`);
    const agent = await getMicrocycleAgent().getMessageAgent();
    const inputJson = JSON.stringify({ overview: microcycle.description || '', days: microcycle.days, isDeload: microcycle.isDeload });
    const result = await agent.invoke(inputJson);
    const updated = await microcycleService.updateMicrocycle(microcycle.id, { message: result.response });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runFullWorkoutChain = async (workout: WorkoutInstance, user: UserWithProfile, microcycle: Microcycle | null): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running full workout chain for workout ${workout.id}`);
    let dayOverview = workout.goal || 'General workout';
    let activityType: 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined;
    if (microcycle) {
      const workoutDate = new Date(workout.date);
      const dayOfWeek = workoutDate.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      if (microcycle.days[dayIndex]) dayOverview = microcycle.days[dayIndex];
      const structuredDay = microcycle.structured?.days?.[dayIndex];
      activityType = structuredDay?.activityType as 'TRAINING' | 'ACTIVE_RECOVERY' | 'REST' | undefined;
    }
    const result = await getWorkoutAgent().generateWorkout(user, dayOverview, microcycle?.isDeload || false, activityType);

    // Log validation result for monitoring
    if (!result.validation.isComplete) {
      console.warn(`[ChainRunner] Workout validation found missing exercises: ${result.validation.missingExercises.join(', ')}`);
    } else {
      console.log(`[ChainRunner] Workout validation passed - structure is complete`);
    }

    // Use validated structure (corrected if needed)
    const updated = await workoutService.updateWorkout(workout.id, {
      description: result.response,
      message: result.message,
      structured: result.validation.validatedStructure
    });
    if (!updated) throw new Error(`Failed to update workout: ${workout.id}`);
    return updated;
  };

  const runWorkoutStructuredChain = async (workout: WorkoutInstance, user: UserWithProfile): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running structured chain for workout ${workout.id}`);
    if (!workout.description) throw new Error(`Workout ${workout.id} has no description to parse`);
    const agent = await getWorkoutAgent().getStructuredAgent(user);
    const result = await agent.invoke(workout.description);

    // Resolve exercises to canonical IDs
    if (result.response && exerciseResolution) {
      await resolveExercisesInStructure(result.response, exerciseResolution, exerciseUse, user.id);
    }

    const updated = await workoutService.updateWorkout(workout.id, { structured: result.response });
    if (!updated) throw new Error(`Failed to update workout: ${workout.id}`);
    return updated;
  };

  const runWorkoutMessageChain = async (workout: WorkoutInstance, user: UserWithProfile): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running message chain for workout ${workout.id}`);
    if (!workout.description) throw new Error(`Workout ${workout.id} has no description to create message from`);
    const agent = await getWorkoutAgent().getMessageAgent(user);
    const result = await agent.invoke(workout.description);
    const updated = await workoutService.updateWorkout(workout.id, { message: result.response });
    if (!updated) throw new Error(`Failed to update workout: ${workout.id}`);
    return updated;
  };

  return {
    async runProfileRegeneration(userId: string): Promise<ProfileRegenerationResult> {
      const startTime = Date.now();
      console.log(`[ChainRunner] Regenerating profile for user ${userId}`);
      const user = await userService.getUser(userId);
      if (!user) throw new Error(`User not found: ${userId}`);
      const signupData = await repos.onboarding.getSignupData(userId);
      if (!signupData) throw new Error(`No signup data found for user: ${userId}`);
      const profile = await fitnessProfileService.createFitnessProfile(user, signupData);
      if (!profile) throw new Error(`Failed to regenerate profile for user: ${userId}`);
      console.log(`[ChainRunner] Profile regenerated for user ${userId}`);
      return { success: true, profile, executionTimeMs: Date.now() - startTime };
    },

    async runFitnessPlanChain(planId: string, operation: ChainOperation): Promise<ChainRunResult<FitnessPlan>> {
      const startTime = Date.now();
      const plan = await fitnessPlanService.getPlanById(planId);
      if (!plan) throw new Error(`Fitness plan not found: ${planId}`);
      const user = await userService.getUser(plan.legacyClientId);
      if (!user) throw new Error(`User not found: ${plan.legacyClientId}`);
      let updatedPlan: FitnessPlan;
      switch (operation) {
        case 'full': updatedPlan = await runFullFitnessPlanChain(plan, user); break;
        case 'structured': updatedPlan = await runFitnessPlanStructuredChain(plan); break;
        case 'message': updatedPlan = await runFitnessPlanMessageChain(plan, user); break;
        default: throw new Error(`Unknown operation: ${operation}`);
      }
      return { success: true, data: updatedPlan, executionTimeMs: Date.now() - startTime, operation };
    },

    async runMicrocycleChain(microcycleId: string, operation: ChainOperation): Promise<ChainRunResult<Microcycle>> {
      const startTime = Date.now();
      const microcycle = await microcycleService.getMicrocycleById(microcycleId);
      if (!microcycle) throw new Error(`Microcycle not found: ${microcycleId}`);
      const user = await userService.getUser(microcycle.clientId);
      if (!user) throw new Error(`User not found: ${microcycle.clientId}`);
      const plan = await fitnessPlanService.getCurrentPlan(microcycle.clientId);
      if (!plan) throw new Error(`No active fitness plan found for client: ${microcycle.clientId}`);
      let updatedMicrocycle: Microcycle;
      switch (operation) {
        case 'full': updatedMicrocycle = await runFullMicrocycleChain(microcycle, plan, user); break;
        case 'structured': updatedMicrocycle = await runMicrocycleStructuredChain(microcycle); break;
        case 'message': updatedMicrocycle = await runMicrocycleMessageChain(microcycle); break;
        default: throw new Error(`Unknown operation: ${operation}`);
      }
      return { success: true, data: updatedMicrocycle, executionTimeMs: Date.now() - startTime, operation };
    },

    async runWorkoutChain(workoutId: string, operation: ChainOperation): Promise<ChainRunResult<WorkoutInstance>> {
      const startTime = Date.now();
      const workout = await workoutService.getWorkoutByIdInternal(workoutId);
      if (!workout) throw new Error(`Workout not found: ${workoutId}`);
      const user = await userService.getUser(workout.clientId);
      if (!user) throw new Error(`User not found: ${workout.clientId}`);
      let microcycle: Microcycle | null = null;
      if (workout.microcycleId) microcycle = await microcycleService.getMicrocycleById(workout.microcycleId);
      let updatedWorkout: WorkoutInstance;
      switch (operation) {
        case 'full': updatedWorkout = await runFullWorkoutChain(workout, user, microcycle); break;
        case 'structured': updatedWorkout = await runWorkoutStructuredChain(workout, user); break;
        case 'message': updatedWorkout = await runWorkoutMessageChain(workout, user); break;
        default: throw new Error(`Unknown operation: ${operation}`);
      }
      return { success: true, data: updatedWorkout, executionTimeMs: Date.now() - startTime, operation };
    },
  };
}

