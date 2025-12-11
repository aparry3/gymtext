import { FitnessPlanRepository } from '@/server/repositories/fitnessPlanRepository';
import { MicrocycleRepository } from '@/server/repositories/microcycleRepository';
import { WorkoutInstanceRepository } from '@/server/repositories/workoutInstanceRepository';
import { UserService } from '@/server/services/user/userService';
import { postgresDb } from '@/server/connections/postgres/postgres';

// Fitness Plan agents
import { createFitnessPlanGenerateAgent } from '@/server/agents/training/plans/operations/generate/chain';
import {
  createStructuredPlanAgent,
  createFormattedFitnessPlanAgent,
  createFitnessPlanMessageAgent,
} from '@/server/agents/training/plans/shared/steps';

// Microcycle agents
import { createMicrocycleGenerateAgent } from '@/server/agents/training/microcycles/operations/generate/chain';
import {
  createStructuredMicrocycleAgent,
  createFormattedMicrocycleAgent,
  createMicrocycleMessageAgent,
} from '@/server/agents/training/microcycles/shared/steps';

// Workout agents
import { createWorkoutGenerateAgent } from '@/server/agents/training/workouts/operations/generate/chain';
import {
  createStructuredWorkoutAgent,
  createFormattedWorkoutAgent,
  createWorkoutMessageAgent,
} from '@/server/agents/training/workouts/shared/steps';

// Types
import type { FitnessPlan } from '@/server/models/fitnessPlan';
import type { Microcycle } from '@/server/models/microcycle';
import type { WorkoutInstance } from '@/server/models/workout';
import type { UserWithProfile } from '@/server/models/userModel';

export type ChainOperation = 'full' | 'structured' | 'formatted' | 'message';

export interface ChainRunResult<T> {
  success: boolean;
  data: T;
  executionTimeMs: number;
  operation: ChainOperation;
}

/**
 * Chain Runner Service
 *
 * Enables running individual chain components (structured, formatted, message)
 * or full chains for fitness plans, microcycles, and workouts.
 *
 * Used for testing and iterative improvement of AI outputs.
 */
export class ChainRunnerService {
  private static instance: ChainRunnerService;
  private fitnessPlanRepo: FitnessPlanRepository;
  private microcycleRepo: MicrocycleRepository;
  private workoutRepo: WorkoutInstanceRepository;
  private userService: UserService;

  private constructor() {
    this.fitnessPlanRepo = new FitnessPlanRepository(postgresDb);
    this.microcycleRepo = new MicrocycleRepository(postgresDb);
    this.workoutRepo = new WorkoutInstanceRepository(postgresDb);
    this.userService = UserService.getInstance();
  }

  public static getInstance(): ChainRunnerService {
    if (!ChainRunnerService.instance) {
      ChainRunnerService.instance = new ChainRunnerService();
    }
    return ChainRunnerService.instance;
  }

  // ============================================
  // FITNESS PLAN OPERATIONS
  // ============================================

  /**
   * Run a chain operation for a fitness plan
   */
  async runFitnessPlanChain(
    planId: string,
    operation: ChainOperation
  ): Promise<ChainRunResult<FitnessPlan>> {
    const startTime = Date.now();

    // Fetch the plan
    const plan = await this.fitnessPlanRepo.getFitnessPlan(planId);
    if (!plan) {
      throw new Error(`Fitness plan not found: ${planId}`);
    }

    // Fetch the user with profile
    const user = await this.userService.getUser(plan.clientId);
    if (!user) {
      throw new Error(`User not found: ${plan.clientId}`);
    }

    let updatedPlan: FitnessPlan;

    switch (operation) {
      case 'full':
        updatedPlan = await this.runFullFitnessPlanChain(plan, user);
        break;
      case 'structured':
        updatedPlan = await this.runFitnessPlanStructuredChain(plan);
        break;
      case 'formatted':
        updatedPlan = await this.runFitnessPlanFormattedChain(plan);
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

  private async runFullFitnessPlanChain(
    plan: FitnessPlan,
    user: UserWithProfile
  ): Promise<FitnessPlan> {
    console.log(`[ChainRunner] Running full fitness plan chain for plan ${plan.id}`);

    const agent = createFitnessPlanGenerateAgent();
    const result = await agent(user);

    const updated = await this.fitnessPlanRepo.updateFitnessPlan(plan.id!, {
      description: result.description,
      formatted: result.formatted,
      message: result.message,
      structured: result.structure,
    });

    if (!updated) {
      throw new Error(`Failed to update fitness plan: ${plan.id}`);
    }

    return updated;
  }

  private async runFitnessPlanStructuredChain(plan: FitnessPlan): Promise<FitnessPlan> {
    console.log(`[ChainRunner] Running structured chain for plan ${plan.id}`);

    const agent = createStructuredPlanAgent({ operationName: 'chain-runner structured' });
    const structure = await agent.invoke({ fitnessPlan: plan.description });

    const updated = await this.fitnessPlanRepo.updateFitnessPlan(plan.id!, {
      structured: structure,
    });

    if (!updated) {
      throw new Error(`Failed to update fitness plan: ${plan.id}`);
    }

    return updated;
  }

  private async runFitnessPlanFormattedChain(plan: FitnessPlan): Promise<FitnessPlan> {
    console.log(`[ChainRunner] Running formatted chain for plan ${plan.id}`);

    const agent = createFormattedFitnessPlanAgent({
      operationName: 'chain-runner formatted',
    });
    const formatted = await agent.invoke({ fitnessPlan: plan.description, user: {} as UserWithProfile });

    const updated = await this.fitnessPlanRepo.updateFitnessPlan(plan.id!, {
      formatted,
    });

    if (!updated) {
      throw new Error(`Failed to update fitness plan: ${plan.id}`);
    }

    return updated;
  }

  private async runFitnessPlanMessageChain(
    plan: FitnessPlan,
    user: UserWithProfile
  ): Promise<FitnessPlan> {
    console.log(`[ChainRunner] Running message chain for plan ${plan.id}`);

    const agent = createFitnessPlanMessageAgent({
      operationName: 'chain-runner message',
    });
    const message = await agent.invoke({ fitnessPlan: plan.description, user });

    const updated = await this.fitnessPlanRepo.updateFitnessPlan(plan.id!, {
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
  async runMicrocycleChain(
    microcycleId: string,
    operation: ChainOperation
  ): Promise<ChainRunResult<Microcycle>> {
    const startTime = Date.now();

    // Fetch the microcycle
    const microcycle = await this.microcycleRepo.getMicrocycleById(microcycleId);
    if (!microcycle) {
      throw new Error(`Microcycle not found: ${microcycleId}`);
    }

    // Fetch the user with profile
    const user = await this.userService.getUser(microcycle.clientId);
    if (!user) {
      throw new Error(`User not found: ${microcycle.clientId}`);
    }

    // Fetch the associated plan for full regeneration
    const plan = await this.fitnessPlanRepo.getFitnessPlan(microcycle.fitnessPlanId);
    if (!plan) {
      throw new Error(`Fitness plan not found: ${microcycle.fitnessPlanId}`);
    }

    let updatedMicrocycle: Microcycle;

    switch (operation) {
      case 'full':
        updatedMicrocycle = await this.runFullMicrocycleChain(microcycle, plan, user);
        break;
      case 'structured':
        updatedMicrocycle = await this.runMicrocycleStructuredChain(microcycle);
        break;
      case 'formatted':
        updatedMicrocycle = await this.runMicrocycleFormattedChain(microcycle);
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

  private async runFullMicrocycleChain(
    microcycle: Microcycle,
    plan: FitnessPlan,
    user: UserWithProfile
  ): Promise<Microcycle> {
    console.log(`[ChainRunner] Running full microcycle chain for microcycle ${microcycle.id}`);

    const agent = createMicrocycleGenerateAgent();
    const result = await agent.invoke({
      planText: plan.description,
      userProfile: user.profile || '',
      absoluteWeek: microcycle.absoluteWeek,
      isDeload: microcycle.isDeload,
    });

    const updated = await this.microcycleRepo.updateMicrocycle(microcycle.id, {
      days: result.days,
      description: result.description,
      isDeload: result.isDeload,
      formatted: result.formatted,
      message: result.message,
      structured: result.structure,
    });

    if (!updated) {
      throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    }

    return updated;
  }

  private async runMicrocycleStructuredChain(microcycle: Microcycle): Promise<Microcycle> {
    console.log(`[ChainRunner] Running structured chain for microcycle ${microcycle.id}`);

    const agent = createStructuredMicrocycleAgent({
      operationName: 'chain-runner structured',
    });

    const structure = await agent.invoke({
      overview: microcycle.description || '',
      days: microcycle.days,
      absoluteWeek: microcycle.absoluteWeek,
      isDeload: microcycle.isDeload,
    });

    const updated = await this.microcycleRepo.updateMicrocycle(microcycle.id, {
      structured: structure,
    });

    if (!updated) {
      throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    }

    return updated;
  }

  private async runMicrocycleFormattedChain(microcycle: Microcycle): Promise<Microcycle> {
    console.log(`[ChainRunner] Running formatted chain for microcycle ${microcycle.id}`);

    const agent = createFormattedMicrocycleAgent({
      operationName: 'chain-runner formatted',
    });

    // MicrocycleChainContext expects { microcycle: MicrocycleGenerationOutput, absoluteWeek, ... }
    const formatted = await agent.invoke({
      microcycle: {
        overview: microcycle.description || '',
        days: microcycle.days,
        isDeload: microcycle.isDeload,
      },
      absoluteWeek: microcycle.absoluteWeek,
      planText: '', // Not needed for formatting
      userProfile: '', // Not needed for formatting
      isDeload: microcycle.isDeload,
    });

    const updated = await this.microcycleRepo.updateMicrocycle(microcycle.id, {
      formatted,
    });

    if (!updated) {
      throw new Error(`Failed to update microcycle: ${microcycle.id}`);
    }

    return updated;
  }

  private async runMicrocycleMessageChain(microcycle: Microcycle): Promise<Microcycle> {
    console.log(`[ChainRunner] Running message chain for microcycle ${microcycle.id}`);

    const agent = createMicrocycleMessageAgent({
      operationName: 'chain-runner message',
    });

    // MicrocycleChainContext expects { microcycle: MicrocycleGenerationOutput, ... }
    const message = await agent.invoke({
      microcycle: {
        overview: microcycle.description || '',
        days: microcycle.days,
        isDeload: microcycle.isDeload,
      },
      absoluteWeek: microcycle.absoluteWeek,
      planText: '', // Not needed for message
      userProfile: '', // Not needed for message
      isDeload: microcycle.isDeload,
    });

    const updated = await this.microcycleRepo.updateMicrocycle(microcycle.id, {
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
  async runWorkoutChain(
    workoutId: string,
    operation: ChainOperation
  ): Promise<ChainRunResult<WorkoutInstance>> {
    const startTime = Date.now();

    // Fetch the workout
    const workout = await this.workoutRepo.getWorkoutById(workoutId);
    if (!workout) {
      throw new Error(`Workout not found: ${workoutId}`);
    }

    // Fetch the user with profile
    const user = await this.userService.getUser(workout.clientId);
    if (!user) {
      throw new Error(`User not found: ${workout.clientId}`);
    }

    // Fetch microcycle for full regeneration
    let microcycle: Microcycle | null = null;
    if (workout.microcycleId) {
      microcycle = await this.microcycleRepo.getMicrocycleById(workout.microcycleId);
    }

    let updatedWorkout: WorkoutInstance;

    switch (operation) {
      case 'full':
        updatedWorkout = await this.runFullWorkoutChain(workout, user, microcycle);
        break;
      case 'structured':
        updatedWorkout = await this.runWorkoutStructuredChain(workout);
        break;
      case 'formatted':
        updatedWorkout = await this.runWorkoutFormattedChain(workout, user);
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

  private async runFullWorkoutChain(
    workout: WorkoutInstance,
    user: UserWithProfile,
    microcycle: Microcycle | null
  ): Promise<WorkoutInstance> {
    console.log(`[ChainRunner] Running full workout chain for workout ${workout.id}`);

    // Determine day overview from microcycle or use existing goal
    let dayOverview = workout.goal || 'General workout';
    if (microcycle) {
      const workoutDate = new Date(workout.date);
      const dayOfWeek = workoutDate.getDay(); // 0 = Sunday
      // Convert to microcycle days array index (0 = Monday)
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      if (microcycle.days[dayIndex]) {
        dayOverview = microcycle.days[dayIndex];
      }
    }

    const agent = createWorkoutGenerateAgent();
    const result = await agent.invoke({
      user,
      date: new Date(workout.date),
      dayOverview,
      isDeload: microcycle?.isDeload || false,
    });

    // Parse existing details to preserve theme
    const existingDetails = typeof workout.details === 'string'
      ? JSON.parse(workout.details)
      : workout.details || {};

    const updated = await this.workoutRepo.update(workout.id, {
      description: result.description,
      message: result.message,
      structured: result.structure,
      details: {
        ...existingDetails,
        formatted: result.formatted,
      },
    });

    if (!updated) {
      throw new Error(`Failed to update workout: ${workout.id}`);
    }

    return updated;
  }

  private async runWorkoutStructuredChain(workout: WorkoutInstance): Promise<WorkoutInstance> {
    console.log(`[ChainRunner] Running structured chain for workout ${workout.id}`);

    if (!workout.description) {
      throw new Error(`Workout ${workout.id} has no description to parse`);
    }

    const agent = createStructuredWorkoutAgent({
      operationName: 'chain-runner structured',
    });
    const structure = await agent.invoke({ description: workout.description });

    const updated = await this.workoutRepo.update(workout.id, {
      structured: structure,
    });

    if (!updated) {
      throw new Error(`Failed to update workout: ${workout.id}`);
    }

    return updated;
  }

  private async runWorkoutFormattedChain(
    workout: WorkoutInstance,
    user: UserWithProfile
  ): Promise<WorkoutInstance> {
    console.log(`[ChainRunner] Running formatted chain for workout ${workout.id}`);

    if (!workout.description) {
      throw new Error(`Workout ${workout.id} has no description to format`);
    }

    const agent = createFormattedWorkoutAgent({
      includeModifications: false,
      operationName: 'chain-runner formatted',
    });
    const formatted = await agent.invoke({
      description: workout.description,
      user,
      date: new Date(workout.date),
    });

    // Parse existing details to preserve other fields
    const existingDetails = typeof workout.details === 'string'
      ? JSON.parse(workout.details)
      : workout.details || {};

    const updated = await this.workoutRepo.update(workout.id, {
      details: {
        ...existingDetails,
        formatted,
      },
    });

    if (!updated) {
      throw new Error(`Failed to update workout: ${workout.id}`);
    }

    return updated;
  }

  private async runWorkoutMessageChain(workout: WorkoutInstance): Promise<WorkoutInstance> {
    console.log(`[ChainRunner] Running message chain for workout ${workout.id}`);

    if (!workout.description) {
      throw new Error(`Workout ${workout.id} has no description to create message from`);
    }

    const agent = createWorkoutMessageAgent({
      operationName: 'chain-runner message',
    });
    const message = await agent.invoke({ description: workout.description });

    const updated = await this.workoutRepo.update(workout.id, {
      message,
    });

    if (!updated) {
      throw new Error(`Failed to update workout: ${workout.id}`);
    }

    return updated;
  }
}
