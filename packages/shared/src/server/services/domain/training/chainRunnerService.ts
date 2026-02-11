// Types
import type { FitnessPlan, PlanStructure } from '@/server/models/fitnessPlan';
import type { Microcycle, MicrocycleStructure } from '@/server/models/microcycle';
import type { WorkoutInstance, WorkoutStructure } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/user';
import type { RepositoryContainer } from '@/server/repositories/factory';
import type { FitnessPlanServiceInstance } from './fitnessPlanService';
import type { MicrocycleServiceInstance } from './microcycleService';
import type { WorkoutInstanceServiceInstance } from './workoutInstanceService';
import type { UserServiceInstance } from '../user/userService';
import type { FitnessProfileServiceInstance } from '../user/fitnessProfileService';
import type { AgentRunnerInstance } from '@/server/agents/runner';
import { SnippetType } from '../../context/builders/experienceLevel';

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
  agentRunner: AgentRunnerInstance;
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
  const { fitnessPlan: fitnessPlanService, microcycle: microcycleService, workoutInstance: workoutService, user: userService, fitnessProfile: fitnessProfileService, agentRunner, exerciseResolution, exerciseUse } = deps;

  // Helper functions for chain operations
  const runFullFitnessPlanChain = async (plan: FitnessPlan, user: UserWithProfile): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running full fitness plan chain for plan ${plan.id}`);
    const result = await agentRunner.invoke('plan:generate', { params: { user } });
    const description = result.response as string;
    const message = (result as Record<string, unknown>).message as string;
    const structure = (result as Record<string, unknown>).structure as PlanStructure;
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { description, message, structured: structure });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFitnessPlanStructuredChain = async (plan: FitnessPlan, user: UserWithProfile): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running structured chain for plan ${plan.id}`);
    const result = await agentRunner.invoke('plan:structured', { input: plan.description || '', params: { user } });
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { structured: result.response as PlanStructure });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFitnessPlanMessageChain = async (plan: FitnessPlan, user: UserWithProfile): Promise<FitnessPlan> => {
    console.log(`[ChainRunner] Running message chain for plan ${plan.id}`);
    const result = await agentRunner.invoke('plan:message', { input: plan.description || '', params: { user } });
    const updated = await fitnessPlanService.updateFitnessPlan(plan.id!, { message: result.response as string });
    if (!updated) throw new Error(`Failed to update fitness plan: ${plan.id}`);
    return updated;
  };

  const runFullMicrocycleChain = async (microcycle: Microcycle, _plan: FitnessPlan, user: UserWithProfile): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running full microcycle chain for microcycle ${microcycle.id}`);
    const result = await agentRunner.invoke('microcycle:generate', {
      input: `Absolute Week: ${microcycle.absoluteWeek}`,
      params: { user, snippetType: SnippetType.MICROCYCLE },
    });
    const mcResponse = result.response as { days: string[]; overview: string; isDeload: boolean };
    const updated = await microcycleService.updateMicrocycle(microcycle.id, {
      days: mcResponse.days,
      description: mcResponse.overview,
      isDeload: mcResponse.isDeload,
      message: (result as Record<string, unknown>).message as string,
      structured: (result as Record<string, unknown>).structure as MicrocycleStructure,
    });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runMicrocycleStructuredChain = async (microcycle: Microcycle, user: UserWithProfile): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running structured chain for microcycle ${microcycle.id}`);
    const result = await agentRunner.invoke('microcycle:structured', {
      input: JSON.stringify({ overview: microcycle.description || '', days: microcycle.days, absoluteWeek: microcycle.absoluteWeek, isDeload: microcycle.isDeload }),
      params: { user },
    });
    const updated = await microcycleService.updateMicrocycle(microcycle.id, { structured: result.response as MicrocycleStructure });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runMicrocycleMessageChain = async (microcycle: Microcycle, user: UserWithProfile): Promise<Microcycle> => {
    console.log(`[ChainRunner] Running message chain for microcycle ${microcycle.id}`);
    const result = await agentRunner.invoke('microcycle:message', {
      input: JSON.stringify({ overview: microcycle.description || '', days: microcycle.days, isDeload: microcycle.isDeload }),
      params: { user },
    });
    const updated = await microcycleService.updateMicrocycle(microcycle.id, { message: result.response as string });
    if (!updated) throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    return updated;
  };

  const runFullWorkoutChain = async (workout: WorkoutInstance, user: UserWithProfile, _microcycle: Microcycle | null): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running full workout chain for workout ${workout.id}`);
    const result = await agentRunner.invoke('workout:generate', {
      params: { user, date: new Date(workout.date) },
    });
    const description = result.response as string;
    const message = (result as Record<string, unknown>).message as string;
    const structure = (result as Record<string, unknown>).structure as WorkoutStructure;
    const updated = await workoutService.updateWorkout(workout.id, { description, message, structured: structure });
    if (!updated) throw new Error(`Failed to update workout: ${workout.id}`);
    return updated;
  };

  const runWorkoutStructuredChain = async (workout: WorkoutInstance, user: UserWithProfile): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running structured chain for workout ${workout.id}`);
    if (!workout.description) throw new Error(`Workout ${workout.id} has no description to parse`);
    const result = await agentRunner.invoke('workout:structured', { input: workout.description, params: { user } });
    const structure = result.response as WorkoutStructure;

    // Resolve exercises to canonical IDs
    if (structure && exerciseResolution) {
      await resolveExercisesInStructure(structure, exerciseResolution, exerciseUse, user.id);
    }

    const updated = await workoutService.updateWorkout(workout.id, { structured: structure });
    if (!updated) throw new Error(`Failed to update workout: ${workout.id}`);
    return updated;
  };

  const runWorkoutMessageChain = async (workout: WorkoutInstance, user: UserWithProfile): Promise<WorkoutInstance> => {
    console.log(`[ChainRunner] Running message chain for workout ${workout.id}`);
    if (!workout.description) throw new Error(`Workout ${workout.id} has no description to create message from`);
    const result = await agentRunner.invoke('workout:message', { input: workout.description, params: { user } });
    const updated = await workoutService.updateWorkout(workout.id, { message: result.response as string });
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
      const user = await userService.getUser(plan.clientId);
      if (!user) throw new Error(`User not found: ${plan.clientId}`);
      let updatedPlan: FitnessPlan;
      switch (operation) {
        case 'full': updatedPlan = await runFullFitnessPlanChain(plan, user); break;
        case 'structured': updatedPlan = await runFitnessPlanStructuredChain(plan, user); break;
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
        case 'structured': updatedMicrocycle = await runMicrocycleStructuredChain(microcycle, user); break;
        case 'message': updatedMicrocycle = await runMicrocycleMessageChain(microcycle, user); break;
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

